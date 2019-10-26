import { Dictionary, NextFunction, Request, Response } from 'express-serve-static-core';
import { HttpContext } from "../../http-context";
import { Utils } from "../../utils";

export interface IHttpEndpointOptions {
  route?: string;
  errorHandler?: (err: Error, req: Request<Dictionary<string>>, res: Response, next: NextFunction) => any;
  authenticate?: boolean;
  authMethod?: (req: Request<Dictionary<string>>, res: Response, next: NextFunction) => Promise<any>;
}

export class HttpEndpointOptions implements IHttpEndpointOptions {
  public route?: string;
  public errorHandler?: (err: Error, req: Request<Dictionary<string>>, res: Response, next: NextFunction) => any;
  public authenticate?: boolean;
  public authMethod?: (req: Request<Dictionary<string>>, res: Response, next: NextFunction) => Promise<any>;

  constructor(init?: IHttpEndpointOptions) {
    if (init) {
      this.route = init.route ? Utils.trimRoute(init.route) : undefined;
      this.errorHandler = init.errorHandler || undefined;
      this.authenticate = init.authenticate || undefined;
      this.authMethod = init.authMethod || undefined;
    }
  }
}
