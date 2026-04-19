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

  static validate(data: unknown): data is CreateProductDto {
    if (typeof data !== 'object' || data === null) return false;
    const d = data as Record<string, unknown>;

    return (
      typeof d['name'] === 'string' && d['name'].length > 0 &&
      typeof d['description'] === 'string' && d['description'].length > 0 &&
      typeof d['price'] === 'number' && d['price'] > 0 &&
      typeof d['category'] === 'string' && d['category'].length > 0 &&
      typeof d['inStock'] === 'boolean'
    );
  }
}
