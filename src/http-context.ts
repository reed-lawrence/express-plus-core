import { Dictionary, NextFunction, Request, Response } from 'express-serve-static-core';

export class HttpContext {
  public req: Request<Dictionary<string>>;
  public res: Response;
  [key: string]: any;

  constructor(req: Request<Dictionary<string>>, res: Response, next: NextFunction) {
    this.req = req;
    this.res = res;
  }
}