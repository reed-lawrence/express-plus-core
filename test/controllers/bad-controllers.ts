import { Controller } from '../../src/decorators/controller.decorator';
import { HttpPost } from '../../src/decorators/http-types.decorator';
import { HttpContext } from '../../src/http-context';
import { Ok } from '../../src/return-types';

export class InvalidController {
  constructor() { }
}

// tslint:disable-next-line:max-classes-per-file
@Controller()
export class InvalidAuthRouteController {
  constructor() { }

  @HttpPost({ authenticate: true })
  public async TestAuth({ req, res }: HttpContext) {
    return Ok(res);
  }
}
