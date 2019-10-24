import 'reflect-metadata';

import express from 'express';
import { Dictionary, NextFunction, Request, Response } from 'express-serve-static-core';
import multer from 'multer';

import { ApiEndpoint } from '../core/api-endpoint';
import { ApiController } from '../core/controller';
import { HttpContentType } from '../core/decorations/http-types/http-content-type.enum';
import { HttpPostOptions } from '../core/decorations/http-types/http-post';
import { HttpRequestType } from '../core/decorations/http-types/http-request-type.enum';
import { HttpContext } from '../core/http-context';
import { Utils } from '../core/utils';
import { SchemaValidator } from '../core/validators/schema-validator';
import { environment } from '../environments/environment';

export interface IServerOptions {
  controllers: Array<(new () => ApiController)>;
  routePrefix?: string;
}

export class Server {
  // Main server
  private app = express();

  // Multipart/form-data
  private multer = multer();

  private controllers: ApiController[] = [];
  private routePrefix?: string;

  constructor(options?: IServerOptions) {
    if (options) {
      if (options.controllers) {
        for (const controllerConst of options.controllers) {
          this.controllers.push(new controllerConst());
        }
      }

      if (options.routePrefix) {
        this.routePrefix = Utils.trimRoute(options.routePrefix);
      }
    }
  }

  public start() {
    this.app.get('/', (req, res) => {
      res.send('Server is active');
    });
    this.registerControllers(this.controllers);

    this.app.listen(environment.PORT, () => {
      console.log('Listening on port ' + environment.PORT);
    });
  }

  private registerControllers(controllers: ApiController[]) {
    for (const controller of controllers) {
      for (const endpoint of controller.endpoints) {
        const route = '/' + controller.getRoute() + '/' + endpoint.route;
        if (endpoint.type === HttpRequestType.GET) {
          console.log("endpoint added at: " + route);
          const contextFn = (req: Request<Dictionary<string>>, res: Response, next: NextFunction) => {
            const context = new HttpContext(req, res, next);
            endpoint.fn(context);
          };
          this.app.get(route, contextFn);
        } else if (endpoint.type === HttpRequestType.POST) {
          const validationFn = (req: Request<Dictionary<string>>, res: Response, next: NextFunction) => {
            const context = new HttpContext(req, res, next);
            if (endpoint.options instanceof HttpPostOptions && endpoint.options.fromBody) {
              SchemaValidator.ValidateBody(req, endpoint.options.fromBody);
            }
            endpoint.fn(context);
          };

          const formatMiddleware = this.getMiddleware(endpoint);
          console.dir("endpoint added at: " + route);
          this.app.post(route, formatMiddleware, validationFn);
        }
      }
    }
  }

  private getMiddleware(endpoint: ApiEndpoint) {
    let formatMiddleware: express.RequestHandler = express.json();
    if (endpoint.options) {
      if (endpoint.options instanceof HttpPostOptions && endpoint.options.contentType) {
        switch (endpoint.options.contentType) {
          case HttpContentType.FormData: {
            formatMiddleware = this.multer.none();
            break;
          }
          case HttpContentType.UrlEncoded: {
            formatMiddleware = express.urlencoded();
          }
        }
      }
    }
    return formatMiddleware;
  }
}
