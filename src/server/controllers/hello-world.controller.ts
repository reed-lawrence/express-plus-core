import { ExampleObject } from '../../classes/example-object';
import { ApiController } from '../../core/controller';
import { Controller } from '../../core/decorations/controller.decorator';
import { HttpContentType } from '../../core/decorations/http-types/http-content-type.enum';
import { HttpGet } from '../../core/decorations/http-types/http-get';
import { HttpPost } from '../../core/decorations/http-types/http-post';
import { ApplicationError } from '../../core/error-handling/application-error';
import { HttpContext } from '../../core/http-context';
import { Ok } from '../../core/return-types';

@Controller()
export class HelloWorldController extends ApiController {

  constructor() {
    super();
  }

  @HttpGet({ route: 'test2/:id/:value?' })
  public async test({ req, res }: HttpContext) {
    return Ok(res, req.params);
  }

  @HttpPost({ fromBody: ExampleObject })
  public async TestSchema({ req, res }: HttpContext) {
    console.log('TestSchema called');
    return Ok(res, 'test');
  }

  @HttpGet()
  public async TestBadRequest({ req, res }: HttpContext) {
    throw new ApplicationError('Unauthorized', 401);
  }

  @HttpPost({ contentType: HttpContentType.UrlEncoded, authenticate: true })
  public async TestFormData({ req, res }: HttpContext) {
    console.dir(req);
    return Ok(res, 'test');
  }

  @HttpGet({ authenticate: true })
  public async TestAuth({ req, res }: HttpContext) {
    return Ok(res, res.locals);
  }

}
