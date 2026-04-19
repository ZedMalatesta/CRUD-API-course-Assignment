import { Product, IProduct } from '../models/Product.js';
 
interface IProductRepo {
  storage: Array<Product>;
  getAll(): Promise<Array<Product>>;
  getById(id: string): Promise<Product | undefined>;
  createProduct(product: Product): Promise<Product>;
  updateProduct(id: string, credentials: Partial<IProduct>): Promise<Product>;
  deleteProduct(id: string): Promise<boolean>;
  reset(): void;
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
 
  async updateProduct(id: string, credentials: Partial<IProduct>): Promise<Product> {
    const index = this.storage.findIndex((elem) => elem.id === id);
    if (credentials.name !== undefined) this.storage[index].name = credentials.name;
    if (credentials.description !== undefined) this.storage[index].description = credentials.description;
    if (credentials.price !== undefined) this.storage[index].price = credentials.price;
    if (credentials.category !== undefined) this.storage[index].category = credentials.category;
    if (credentials.inStock !== undefined) this.storage[index].inStock = credentials.inStock;
    return this.storage[index];
  }
 
  async deleteProduct(id: string): Promise<boolean> {
    const index = this.storage.findIndex((elem) => elem.id === id);
    if (index > -1) {
      this.storage.splice(index, 1);
      return true;
    }
    return false;
  }
 
  reset(): void {
    this.storage = [];
  }
}