import { Controller } from "../../src/decorators/controller.decorator";
import { ApiController } from "../../src/api-controller";
import { HttpContext } from "../../src/http-context";
import { Ok } from "../../src/return-types";
import { HttpGet, HttpDelete, HttpPost, HttpPut } from "../../src/decorators/http-types.decorator";
import { ExampleObject } from "../classes/example-object";
import { Product, products } from '../classes/product';
import { BadRequestError } from "../../src/error-handlers/bad-request-error";

@Controller()
export class ProductsController extends ApiController {

  constructor() {
    super();
  }

  @HttpGet({ params: ':id?' })
  @HttpDelete({ params: ':id' })
  @HttpPost({ fromBody: Product })
  @HttpPut({ fromBody: Product })
  public async default({ req, res }: HttpContext) {
    switch (req.method) {
      case 'GET': {
        if (req.params.id) {
          const toFind = parseInt(req.params.id);
          if (toFind !== NaN) {
            return Ok(res, products.find(p => p.id === toFind));
          } else {
            throw new BadRequestError('supplied product id not a number type');
          }
        }
        return Ok(res, products);
      }
      case 'POST': {
        return Ok(res, 'POST ok');
      }
      case 'PUT': {
        return Ok(res, 'PUT ok');
      }
      case 'DELETE': {
        return Ok(res, 'DELETE ok');
      }
    }
  }
}