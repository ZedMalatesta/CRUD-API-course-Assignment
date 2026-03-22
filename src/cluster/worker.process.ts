import { randomUUID } from 'node:crypto';
import { Product } from '../models/Product.js';
import { ProductRepo } from '../repository/repository.js';
import { DbProcessAction, DbProcessRequest, DbProcessResponse } from './db.process.js';

const PORT = parseInt(process.env.PORT ?? '4000', 10);
const WORKER_PORT = parseInt(process.env.WORKER_PORT ?? String(PORT + 1), 10);

const pendingResolvers = new Map<string, (data: unknown) => void>();

function sendDbRequest(action: DbProcessAction, payload?: unknown): Promise<unknown> {
  return new Promise((resolve) => {
    const requestId = randomUUID();
    pendingResolvers.set(requestId, resolve);
    process.send!({ requestId, action, payload } satisfies DbProcessRequest);
  });
}

process.on('message', (msg: DbProcessResponse) => {
  const resolve = pendingResolvers.get(msg.requestId);
  if (!resolve) return;
  pendingResolvers.delete(msg.requestId);
  resolve(msg.data);
});

function overrideRepoMethods(repo: ProductRepo): void {
  repo.getAll = () => sendDbRequest('GET_ALL') as Promise<Array<Product>>;
  repo.getById = (id) => sendDbRequest('GET_BY_ID', id) as Promise<Product | undefined>;
  repo.createProduct = (product) =>
    sendDbRequest('CREATE', {
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      inStock: product.inStock,
    }) as Promise<Product>;
  repo.updateProduct = (id, credentials) =>
    sendDbRequest('UPDATE', { id, credentials }) as Promise<Product>;
  repo.deleteProduct = (id) => sendDbRequest('DELETE', id) as Promise<boolean>;
}

export async function startWorkerProcess(): Promise<void> {
  const { app, repo } = await import('../app.js');

  overrideRepoMethods(repo);

  await app.listen({ port: WORKER_PORT, host: '127.0.0.1' });
  console.log(`Worker ${process.pid} listening on port ${WORKER_PORT}`);
}