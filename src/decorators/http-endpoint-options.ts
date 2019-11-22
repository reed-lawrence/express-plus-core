import { CorsOptions } from 'cors';
import { Dictionary, NextFunction, Request, Response } from 'express-serve-static-core';
import { Utils } from "../utils";

export interface IHttpEndpointOptions {
  route?: string;
  errorHandler?: (err: Error, req: Request<Dictionary<string>>, res: Response, next: NextFunction) => any;
  authenticate?: boolean;
  authMethod?: (req: Request<Dictionary<string>>, res: Response, next: NextFunction) => Promise<any>;
  cors?: CorsOptions | false;
}

export class HttpEndpointOptions implements IHttpEndpointOptions {
  public route?: string;
  public errorHandler?: (err: Error, req: Request<Dictionary<string>>, res: Response, next: NextFunction) => any;
  public authenticate?: boolean;
  public authMethod?: (req: Request<Dictionary<string>>, res: Response, next: NextFunction) => Promise<any>;
  public cors?: CorsOptions | false;

  constructor(init?: IHttpEndpointOptions) {
    if (init) {
      this.route = init.route ? Utils.trimRoute(init.route) : undefined;
      this.errorHandler = init.errorHandler || undefined;
      this.authenticate = init.authenticate || undefined;
      this.authMethod = init.authMethod || undefined;
      this.cors = init.cors || undefined;
    }
  }
}
