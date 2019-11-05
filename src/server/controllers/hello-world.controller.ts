import { ExampleObject } from '../../classes/example-object';
import { ApiController } from '../../core/controller';
import { Controller } from '../../core/decorators/controller.decorator';
import { HttpContentType } from '../../core/decorators/http-types/http-content-type.enum';
import { HttpGet } from '../../core/decorators/http-types/http-get';
import { HttpPost } from '../../core/decorators/http-types/http-post';
import { ApplicationError } from '../../core/error-handling/application-error';
import { HttpContext } from '../../core/http-context';
import { Ok } from '../../core/return-types';
import { HttpHead } from '../../core/decorators/http-types/http-head';
import { HttpPut } from '../../core/decorators/http-types/http-put';
import { HttpConnect } from '../../core/decorators/http-types/http-connect';
import { HttpDelete } from '../../core/decorators/http-types/http-delete';
import { HttpTrace } from '../../core/decorators/http-types/http-trace';

@Controller({ route: 'v1/MyController' })
export class HelloWorldController extends ApiController {

  constructor() {
    super();
  }

  @HttpGet({ route: 'test2/:id/:value?' })
  public async test({ req, res }: HttpContext) {
    return Ok(res, req.params);
  }

  @HttpPost({ fromBody: { id: 0, value: '' } })
  public async TestSchema({ req, res }: HttpContext) {
    console.log('TestSchema called');
    return Ok(res, 'Ok');
  }

  @HttpGet({ cors: { origin: 'https://test.com' } })
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
    return Ok(res, req.headers);
  }

  @HttpPut({ contentType: HttpContentType.UrlEncoded, fromBody: ExampleObject })
  public async TestPut({ req, res }: HttpContext) {
    console.dir(req);
    return Ok(res, 'Put Successful');
  }

  @HttpConnect()
  public async TestConnect({ req, res }: HttpContext) {
    return Ok(res, 'connected');
  }

  @HttpDelete()
  public async TestDelete({ req, res }: HttpContext) {
    return Ok(res, req.params);
  }

  @HttpHead()
  public async TestHead({ req, res }: HttpContext) {
    return Ok(res, 'Head Ok');
  }

  @HttpTrace()
  public async TestTrace({ req, res }: HttpContext) {
    return Ok(res, 'trace');
  }

}
