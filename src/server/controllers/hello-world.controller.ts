import { ExampleObject } from '../../classes/example-object';
import { ApiController } from '../../core/controller';
import { Controller } from '../../core/decorations/controller.decorator';
import { HttpContentType } from '../../core/decorations/http-types/http-content-type.enum';
import { HttpGet } from '../../core/decorations/http-types/http-get';
import { HttpPost } from '../../core/decorations/http-types/http-post';
import { HttpContext } from '../../core/http-context';
import { BadRequest, Ok } from '../../core/return-types';
import { ApplicationError } from '../../core/error-handling/application-error';

@Controller()
export class HelloWorldController extends ApiController {

  constructor() {
    super();
  }

  @HttpGet({ route: 'test2/:id' })
  public async test(context: HttpContext) {
    return Ok(context, 'Hello World Test: ' + (context.request.params as any).id);
  }

  @HttpPost({ fromBody: ExampleObject })
  public async TestSchema(context: HttpContext) {
    console.log('TestSchema called');
    return Ok(context, 'test');
  }

  @HttpGet()
  public async TestBadRequest(context: HttpContext) {
    throw new ApplicationError('Unauthorized', 401);
  }

  @HttpPost({ contentType: HttpContentType.UrlEncoded })
  public async TestFormData(context: HttpContext) {
    console.dir(context.request);
    return Ok(context, 'test');
  }

}
