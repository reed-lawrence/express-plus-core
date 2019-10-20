import { ApiController } from "../../core/controller";
import { Request, Response } from "express-serve-static-core";
import { HttpType } from "../../core/decorations/http-type";
import { ExampleObject } from "../../classes/example-object";
import { HttpContext } from "../../core/http-context";
import { Ok, BadRequest } from "../../core/return-types";

export class HelloWorldController<T> extends ApiController<T> {

  constructor() {
    super();
  }

  default(context: HttpContext) {
    return Ok(context, 'Hello world default overridden');
  }

  @HttpType('GET', { route: 'test2/:id' })
  test(context: HttpContext) {
    return Ok(context, 'Hello World Test: ' + (context.request.params as any).id);
  }

  @HttpType('POST', { fromBody: ExampleObject })
  TestSchema(context: HttpContext) {
    console.log('TestSchema called');
    return Ok(context, 'test');
  }

  @HttpType('GET')
  TestBadRequest(context: HttpContext) {
    return BadRequest(context, 'bad request');
  }

}