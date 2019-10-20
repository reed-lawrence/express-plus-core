import { ApiController } from "../../core/controller";
import { Request, Response } from "express-serve-static-core";
import { HttpType } from "../../core/decorations/http-type";
import { ExampleObject } from "../../classes/example-object";

export class HelloWorldController<T> extends ApiController<T> {

  constructor() {
    super();
  }

  default(req: Request<string[]>, res: Response) {
    return res.send('Hello World From Controller');
  }

  @HttpType('GET', { route: 'test2/:id' })
  test(req: Request<string[]>, res: Response) {
    return res.send('Hello World Test: ' + (req.params as any).id);
  }

  @HttpType('POST', { fromBody: ExampleObject })
  TestSchema(req: Request<string[]>, res: Response) {
    console.log('TestSchema called');
    return res.send('Test');
  }

}