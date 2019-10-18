import { ApiController, HttpType } from "./controller";
import { Request, Response } from "express-serve-static-core";

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

}