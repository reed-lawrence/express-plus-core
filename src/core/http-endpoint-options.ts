import { Utils } from "./utils";
import { Dictionary, NextFunction, Request, Response } from 'express-serve-static-core';


export interface IHttpEndpointOptions {
  route?: string;
  errorHandler?: (err: Error, req: Request<Dictionary<string>>, res: Response, next: NextFunction) => any;
}

export class HttpEndpointOptions implements IHttpEndpointOptions {
  public route?: string;
  public errorHandler?: (err: Error, req: Request<Dictionary<string>>, res: Response, next: NextFunction) => any;

  constructor(init?: IHttpEndpointOptions) {
    if (init) {
      this.route = init.route ? Utils.trimRoute(init.route) : undefined;
      this.errorHandler = init.errorHandler ? init.errorHandler : undefined;
    }
  }
}
