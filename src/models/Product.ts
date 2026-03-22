import { randomUUID } from 'node:crypto';

export interface IProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  inStock: boolean;
}

export type CreateProductDto = Omit<IProduct, 'id'>;

export class Product implements IProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  inStock: boolean;

  constructor({ name, description, price, category, inStock }: CreateProductDto) {
    this.id = randomUUID();
    this.name = name;
    this.description = description;
    this.price = price;
    this.category = category;
    this.inStock = inStock;
  }
}
