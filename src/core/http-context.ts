import { Request, Response, Params, Dictionary, NextFunction } from "express-serve-static-core";

export class HttpContext {
  request: Request<Dictionary<string>>;
  response: Response;
  next: NextFunction;

  constructor(req: Request<Dictionary<string>>, res: Response, next: NextFunction) {
    this.request = req;
    this.response = res;
    this.next = next;
  }
}