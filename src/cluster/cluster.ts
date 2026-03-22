import cluster from 'node:cluster';
import os from 'node:os';
import http from 'node:http';
import { Product } from '../models/Product.js';
import { ProductRepo } from '../repository/repository.js';
import { DbProcess, DbProcessRequest, DbProcessResponse } from './db.process.js';
import { startWorkerProcess } from './worker.process.js';

const PORT = parseInt(process.env.PORT ?? '4000', 10);
const NUM_WORKERS = os.availableParallelism() - 1 || 1;

function startLoadBalancer(appWorkers: Array<ReturnType<typeof cluster.fork>>): void {
  let current = 0;

  const loadBalancer = http.createServer((req, res) => {
    const worker = appWorkers[current];
    current = (current + 1) % appWorkers.length;
    const workerPort = PORT + 1 + appWorkers.indexOf(worker);

    const proxy = http.request(
      { hostname: '127.0.0.1', port: workerPort, path: req.url, method: req.method, headers: req.headers },
      (proxyRes) => {
        res.writeHead(proxyRes.statusCode ?? 500, proxyRes.headers);
        proxyRes.pipe(res);
      },
    );

    proxy.on('error', () => {
      res.writeHead(502);
      res.end(JSON.stringify({ message: 'Bad Gateway' }));
    });

    req.pipe(proxy);
  });

  loadBalancer.listen(PORT, () => {
    console.log(`Load balancer listening on http://localhost:${PORT}`);
    appWorkers.forEach((_, i) =>
      console.log(`  Worker ${i + 1} on port ${PORT + 1 + i}`),
    );
  });
}

function setupWorkerMessaging(
  worker: ReturnType<typeof cluster.fork>,
  dbWorker: ReturnType<typeof cluster.fork>,
  pendingRequests: Map<string, number>,
): void {
  worker.on('message', (msg: DbProcessRequest) => {
    pendingRequests.set(msg.requestId, worker.id);
    dbWorker.send(msg);
  });
}

function startPrimaryProcess(): void {
  console.log(`Primary ${process.pid} is running`);
  console.log(`Starting ${NUM_WORKERS} workers...`);

  const dbWorker = cluster.fork({ DB_PROCESS: 'true' });
  const appWorkers: Array<ReturnType<typeof cluster.fork>> = [];
  const pendingRequests = new Map<string, number>();

  dbWorker.once('message', (msg: { ready: boolean }) => {
    if (!msg.ready) return;

    for (let i = 0; i < NUM_WORKERS; i++) {
      const worker = cluster.fork({ WORKER_PORT: String(PORT + 1 + i) });
      appWorkers.push(worker);
      setupWorkerMessaging(worker, dbWorker, pendingRequests);
    }

    dbWorker.on('message', (msg: DbProcessResponse) => {
      const workerId = pendingRequests.get(msg.requestId);
      if (workerId === undefined) return;
      pendingRequests.delete(msg.requestId);
      appWorkers.find((w) => w.id === workerId)?.send(msg);
    });

    startLoadBalancer(appWorkers);

    cluster.on('exit', (dead) => {
      const index = appWorkers.indexOf(dead as ReturnType<typeof cluster.fork>);
      if (index === -1) return;
      console.log(`Worker ${dead.process.pid} died. Restarting...`);
      const replacement = cluster.fork({ WORKER_PORT: String(PORT + 1 + index) });
      appWorkers[index] = replacement;
      setupWorkerMessaging(replacement, dbWorker, pendingRequests);
    });
  });
}

function startDbProcess(): void {
  const repo = new ProductRepo([] as Array<Product>);
  const dbProcess = new DbProcess(repo);
  dbProcess.start();
}

if (cluster.isPrimary) {
  startPrimaryProcess();
} else if (process.env.DB_PROCESS === 'true') {
  startDbProcess();
} else {
  startWorkerProcess();
}
