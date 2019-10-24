import { Dictionary, NextFunction, Params, Request, Response } from "express-serve-static-core";

export class HttpContext {
  public request: Request<Dictionary<string>>;
  public response: Response;
  public next: NextFunction;

  constructor(req: Request<Dictionary<string>>, res: Response, next: NextFunction) {
    this.request = req;
    this.response = res;
    this.next = next;
  }
}
