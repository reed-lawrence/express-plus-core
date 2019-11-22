
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
    return Ok(res, 'GET works');
  }

  @HttpPost()
  public async TestPost({ req, res }: HttpContext) {
    return Ok(res, 'POST works');
  }

  @HttpGet({ route: 'OverrideRoute' })
  public async OverwrittenRoute({ req, res }: HttpContext) {
    return Ok(res, 'ok');
  }

  @HttpPost({ fromBody: ExampleObject })
  public async PostWithSchemaValidation({ req, res }: HttpContext) {
    return Ok(res, 'formatting good');
  }

  public async shouldNotRegister() {
    return true;
  }

}