import { Dictionary, NextFunction, Request, Response } from 'express-serve-static-core';
import { IPartialDictionary, IRequest } from './request';

export class HttpContext<BodyType = any, ParamsType extends IPartialDictionary = any, QueryType extends IPartialDictionary = any> {
  public req: IRequest<BodyType, ParamsType, QueryType>;
  public res: Response;
  [key: string]: any;

  constructor(req: Request, res: Response, next: NextFunction) {
    this.req = req as unknown as IRequest<BodyType, ParamsType, QueryType>;
    this.res = res;
  }
}
