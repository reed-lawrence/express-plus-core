import { Min } from 'class-validator';

export interface IProduct {
  id: number;
  name: string;
  price: number;
  category: string;
}

export class Product implements IProduct {
  id: number = 0;
  name: string = '';

  @Min(0)
  price: number = 0;

  category: string = '';

  constructor(init?: Partial<IProduct>) {
    if (init) {
      if (init.id) { this.id = init.id; }
      if (init.category) { this.category = init.category; }
      if (init.price) { this.price = init.price; }
      if (init.name) { this.name = init.name; }
    }
  }
}

export const products: Product[] = [
  new Product({ id: 1, name: 'Tomato Soup', price: 199, category: 'Groceries' }),
  new Product({ id: 2, name: 'Hammer', price: 1499, category: 'Home Improvement' })
];