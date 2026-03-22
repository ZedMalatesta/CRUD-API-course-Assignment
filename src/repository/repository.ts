import { Product } from '../models/Product.js';

interface IProductRepo {
  storage: Array<Product>;
}

export class ProductRepo implements IProductRepo {
  storage: Array<Product>;

  constructor(storage: Array<Product>) {
    this.storage = storage;
  }

  async getAll(): Promise<Array<Product>> {
    return this.storage;
  }
}
