import { Controller } from "../../src/decorators/controller.decorator";
import { ApiController } from "../../src/api-controller";
import { HttpContext } from "../../src/http-context";
import { Ok } from "../../src/return-types";
import { HttpGet, HttpDelete, HttpPost, HttpPut } from "../../src/decorators/http-types.decorator";
import { Product } from '../classes/product';
import { BadRequestError } from "../../src/error-handlers/bad-request-error";
import { ApplicationError } from "../../src/error-handlers/application-error";
import { ForbiddenError } from "../../src/error-handlers/forbidden-error";

@Controller()
export class ProductsController extends ApiController {

  constructor() {
    super();
  }

  private products: Product[] = [
    new Product({ id: 1, name: 'Tomato Soup', price: 199, category: 'Groceries' }),
    new Product({ id: 2, name: 'Hammer', price: 1499, category: 'Home Improvement' })
  ];

  private async getProducts(id?: string) {
    if (id) {
      const toFind = parseInt(id);
      if (isNaN(toFind)) {
        throw new ApplicationError(`Supplied id to get is not a numeric value`)
      }

      const product = this.products.find(p => p.id === toFind);
      if (product) {
        return product as Product;
      } else {
        throw new BadRequestError('Supplied product Id does not match a product');
      }
    } else {
      return this.products;
    }
  }

  private async createProduct(payload: Product, products: Product[]) {
    for (let i = 1; i <= (products.length + 1); i++) {
      if (products.findIndex(p => p.id === i) === -1) {
        payload.id = i;
        products.push(payload);
        return payload;
      }
    }
    throw new ApplicationError('Unable to assign an Id to the newly created product');
  }

  private async updateProduct(payload: Product, products: Product[]) {
    const index = products.findIndex(p => p.id === payload.id);
    if (index === -1) {
      throw new ApplicationError(`Unable to find matching product corresponding to id: ${payload.id}`);
    }
    products[index] = payload;
    return products[index];
  }

  private async deleteProduct(id: string, products: Product[]) {
    const toFind = parseInt(id);
    if (isNaN(toFind)) {
      throw new ApplicationError(`Supplied id to delete is not a numeric value`)
    }

    const index = products.findIndex(p => p.id === toFind);
    if (index === -1) {
      throw new ApplicationError(`Unable to find matching product corresponding to id: ${toFind}`);
    }
    return products.splice(index, 1)[0];
  }

  @HttpGet({ params: ':id?' })
  @HttpDelete({ params: ':id' })
  @HttpPost({ fromBody: Product })
  @HttpPut({ fromBody: Product })
  public async default({ req, res }: HttpContext<Product>) {
    switch (req.method) {
      case 'GET': {
        return Ok(res, await this.getProducts(req.params.id));
      }
      case 'POST': {
        return Ok(res, await this.createProduct(req.body, this.products));
      }
      case 'PUT': {
        return Ok(res, await this.updateProduct(req.body, this.products));
      }
      case 'DELETE': {
        return Ok(res, await this.deleteProduct(req.params.id, this.products));
      }
    }
  }
}