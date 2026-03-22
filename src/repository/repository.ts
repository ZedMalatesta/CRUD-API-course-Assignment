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

  async getById(id: string): Promise<Product | undefined> {
    return this.storage.find((elem) => elem.id === id);
  }

  async createProduct(product: Product): Promise<Product> {
    this.storage.push(product);
    return product;
  }
}
