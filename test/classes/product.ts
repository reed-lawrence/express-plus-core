import { Min, IsNumber, IsString } from 'class-validator';
import { IsRequired } from '../../src/validators/is-required';

export interface IProduct {
  id: number;
  name: string;
  price: number;
  category: string;
}

export class Product implements IProduct {
  @IsRequired()
  @IsNumber()
  id: number = 0;

  @IsRequired()
  @IsString()
  name: string = '';

  @Min(0)
  @IsNumber()
  price: number = 0;

  @IsRequired()
  @IsString()
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