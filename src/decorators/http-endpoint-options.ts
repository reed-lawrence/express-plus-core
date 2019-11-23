import { CorsOptions } from 'cors';
import { Dictionary, NextFunction, Request, Response } from 'express-serve-static-core';
import { Utils } from "../utils";

export interface IHttpEndpointOptions {
  route?: string;
  errorHandler?: (err: Error, req: Request<Dictionary<string>>, res: Response, next: NextFunction) => any;
  authenticate?: boolean;
  authMethod?: (req: Request<Dictionary<string>>, res: Response, next: NextFunction) => Promise<any>;
  cors?: CorsOptions | false;

  /**
   * @summary Route parameters to expect following the specified route. Should
   * follow the parameter syntax for express routes.
   * ```typescript
   * ':id/:page?' // id required, page optional
   * ```
   */
  params?: string;
}

export class HttpEndpointOptions implements IHttpEndpointOptions {
  public route?: string;
  public errorHandler?: (err: Error, req: Request<Dictionary<string>>, res: Response, next: NextFunction) => any;
  public authenticate?: boolean;
  public authMethod?: (req: Request<Dictionary<string>>, res: Response, next: NextFunction) => Promise<any>;
  public cors?: CorsOptions | false;
  public params?: string;

  constructor(init?: IHttpEndpointOptions) {
    if (init) {
      this.route = init.route ? Utils.trimRoute(init.route) : undefined;
      this.errorHandler = init.errorHandler || undefined;
      this.authenticate = init.authenticate || undefined;
      this.authMethod = init.authMethod || undefined;
      this.cors = init.cors || undefined;
      this.params = init.params || undefined;
    }

    if (this.route && (this.route.indexOf('?') !== -1 || this.route.indexOf(':') !== -1)) {
      throw new Error('Route parameters should be supplied via the `params` option');
    }
  }
}
