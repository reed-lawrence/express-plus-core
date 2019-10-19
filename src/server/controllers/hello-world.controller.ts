import { ApiController } from "../../core/controller";
import { Request, Response } from "express-serve-static-core";
import { HttpType } from "../../core/decorations/http-type";
import { ExampleObject } from "../../classes/example-object";

export class HelloWorldController extends ApiController {

  constructor() {
    super();
  }

  default(req: Request<string[]>, res: Response) {
    return res.send('Hello World From Controller');
  }

  @HttpType('GET')
  test(req: Request<string[]>, res: Response) {
    return res.send('Hello World Test');
  }

  @HttpType('POST', ExampleObject)
  TestSchema(req: Request<string[]>, res: Response) {
    console.log('TestSchema called');
    return res.send('Test');
  }

}