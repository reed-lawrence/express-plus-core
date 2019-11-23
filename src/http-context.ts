import { Dictionary, NextFunction, Request, Response } from 'express-serve-static-core';
import { IRequest } from './request';

export class HttpContext<BodyType = any, ParamsType extends Dictionary<string> = any> {
  public req: IRequest<BodyType, ParamsType>;
  public res: Response;
  [key: string]: any;

  constructor(req: Request<ParamsType>, res: Response, next: NextFunction) {
    this.req = req;
    this.res = res;
  }
}
