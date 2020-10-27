
import { Controller } from '../../src/decorators/controller.decorator';
import { HttpContentType, HttpGet, HttpPost } from '../../src/decorators/http-types.decorator';
import { HttpContext } from '../../src/http-context';
import { Ok } from '../../src/return-types';
import { ExampleObject } from '../classes/example-object';

@Controller()
export class TestController {

  constructor(
    private test?: string
  ) {

  }

  @HttpGet()
  public async TestGet({ req, res }: HttpContext) {
    return Ok(res, 'GET works');
  }

  @HttpPost({ contentType: HttpContentType.Any })
  public async TestPost({ req, res }: HttpContext) {
    return Ok(res, 'POST works');
  }

  @HttpPost()
  public async PostJsonEcho({ req, res }: HttpContext) {
    return Ok(res, req.body);
  }

  @HttpGet({ route: 'OverrideRoute' })
  public async OverwrittenRoute({ req, res }: HttpContext) {
    return Ok(res, 'ok');
  }

  @HttpGet({ params: ":id/:value?" })
  public async GetWithParams({ req, res }: HttpContext<any, { id: string; value?: string }>) {
    return Ok(res, req.params);
  }

  @HttpGet()
  public async GetWithQuery({ req, res }: HttpContext<any, any, Partial<{ id: string, value: string }>>) {
    return Ok(res, req.query);
  }

  @HttpPost({ fromBody: ExampleObject })
  public async PostWithSchemaValidation({ req, res }: HttpContext<ExampleObject>) {
    return Ok(res, 'formatting good');
  }

  @HttpPost({ contentType: HttpContentType.FormData })
  public async PostWithFormData({ req, res }: HttpContext) {
    // console.log(req);
    return Ok(res, req.body);
  }

  @HttpPost({ contentType: HttpContentType.UrlEncoded })
  public async PostWithUrlEncoded({ req, res }: HttpContext) {
    // console.log(req);
    return Ok(res, req.body);
  }

  public async shouldNotRegister() {
    return true;
  }

}
