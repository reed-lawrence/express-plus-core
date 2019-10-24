import { ApiController } from "../../core/controller";
import { ExampleObject } from "../../classes/example-object";
import { HttpContext } from "../../core/http-context";
import { Ok, BadRequest } from "../../core/return-types";
import { HttpGet } from "../../core/decorations/http-types/http-get";
import { HttpPost } from "../../core/decorations/http-types/http-post";
import { HttpContentType } from "../../core/decorations/http-types/http-content-type.enum";

// TODO: Add controller decorator
export class HelloWorldController<T> extends ApiController<T> {

  constructor() {
    super();
  }

  async default(context: HttpContext) {
    return Ok(context, 'Hello world default overridden');
  }

  @HttpGet({ route: 'test2/:id' })
  async test(context: HttpContext) {
    return Ok(context, 'Hello World Test: ' + (context.request.params as any).id);
  }

  @HttpPost({ fromBody: ExampleObject })
  async TestSchema(context: HttpContext) {
    console.log('TestSchema called');
    return Ok(context, 'test');
  }

  @HttpGet()
  async TestBadRequest(context: HttpContext) {
    return BadRequest(context, 'bad request');
  }

  @HttpPost({ contentType: HttpContentType.UrlEncoded })
  async TestFormData(context: HttpContext) {
    console.dir(context.request);
    return Ok(context, 'test');
  }

}