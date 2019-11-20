
import { ApiController } from '../../src/api-controller';
import { Controller } from '../../src/decorators/controller.decorator';
import { HttpGet, HttpPost } from '../../src/decorators/http-types.decorator';
import { HttpContext } from '../../src/http-context';
import { Ok } from '../../src/return-types';
import { ExampleObject } from '../classes/example-object';

@Controller()
export class TestController extends ApiController {

  constructor() {
    super();
  }

  @HttpGet()
  public async TestGet({ req, res }: HttpContext) {
    return Ok(res, 'Hello world');
  }

  @HttpPost({ fromBody: ExampleObject })
  public async TestPost({ req, res }: HttpContext) {
    return Ok(res, 'Formatting ok');
  }

  public async shouldNotRegister() {
    return true;
  }

}