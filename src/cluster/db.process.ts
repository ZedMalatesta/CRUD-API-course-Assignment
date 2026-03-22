import { Product } from '../models/Product.js';
import { ProductRepo } from '../repository/repository.js';

export type DbProcessAction = 'GET_ALL' | 'GET_BY_ID' | 'CREATE' | 'UPDATE' | 'DELETE';

export interface DbProcessRequest {
  requestId: string;
  action: DbProcessAction;
  payload?: unknown;
}

export interface DbProcessResponse {
  requestId: string;
  data: unknown;
}

interface IDbProcess {
  repo: ProductRepo;
  start(): void;
  handleMessage(msg: DbProcessRequest): Promise<void>;
}

export class DbProcess implements IDbProcess {
  repo: ProductRepo;

  constructor(repo: ProductRepo) {
    this.repo = repo;
  }

  start = (): void => {
    process.send!({ ready: true });
    process.on('message', (msg: DbProcessRequest) => this.handleMessage(msg));
  };

  handleMessage = async (msg: DbProcessRequest): Promise<void> => {
    const { requestId, action, payload } = msg;
    console.log(`[DB Process] ← Received: ${action} (${requestId})`);
    let data: unknown;

    switch (action) {
      case 'GET_ALL':
        data = await this.repo.getAll();
        break;

      case 'GET_BY_ID':
        data = (await this.repo.getById(payload as string)) ?? null;
        break;

      case 'CREATE': {
        const product = new Product(payload as Omit<Product, 'id'>);
        data = await this.repo.createProduct(product);
        break;
      }

      case 'UPDATE': {
        const { id, credentials } = payload as { id: string; credentials: Partial<Product> };
        data = await this.repo.updateProduct(id, credentials);
        break;
      }

      case 'DELETE':
        data = await this.repo.deleteProduct(payload as string);
        break;
    }

    console.log(`[DB Process] → Responding: ${action} (${requestId})`);
    process.send!({ requestId, data } satisfies DbProcessResponse);
  };
}
