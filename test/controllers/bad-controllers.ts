import { ApiController } from '../../src/api-controller';
import { Controller } from '../../src/decorators/controller.decorator';
import { HttpPost } from '../../src/decorators/http-types.decorator';
import { HttpContext } from '../../src/http-context';
import { Ok } from '../../src/return-types';

export class InvalidController extends ApiController {
  constructor() {
    super();
  }
}

@Controller()
export class InvalidAuthRoute extends ApiController {
  constructor() {
    super();
  }

  @HttpPost({ authenticate: true })
  public async TestAuth({ req, res }: HttpContext) {
    return Ok(res);
  }
}