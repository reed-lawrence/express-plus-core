import 'reflect-metadata';

import express, { RequestHandler } from 'express';
import { Dictionary, NextFunction, Request, Response } from 'express-serve-static-core';
import multer from 'multer';

import { ApiEndpoint } from './api-endpoint';
import { ApiController } from './controller';
import { HttpContentType } from './decorations/http-types/http-content-type.enum';
import { HttpPostOptions } from './decorations/http-types/http-post';
import { HttpRequestType } from './decorations/http-types/http-request-type.enum';
import { HttpContext } from './http-context';
import { Utils } from './utils';
import { SchemaValidator } from './validators/schema-validator';
import { environment } from '../environments/environment';
import { MetadataKeys } from './metadata-keys';
import { ApplicationError } from './error-handling/application-error';
import { DefaultErrorResponse } from './error-handling/default-error-response';
import { routeMapTemplate } from './html/route-map.html';

export interface IServerOptions {
  controllers: Array<(new () => ApiController)>;
  routePrefix?: string;
  errorHandler?: (err: any, req: Request<Dictionary<string>>, res: Response, next: NextFunction) => any;
}

export class Server {
  // Main server
  private app = express();

  // Multipart/form-data
  private multer = multer();

  private controllers: ApiController[] = [];
  private routePrefix?: string;
  private readonly errorHandler = (err: Error | ApplicationError, req: Request<Dictionary<string>>, res: Response, next: NextFunction) => {
    const status = err instanceof ApplicationError ? err.status : 500;
    res.status(status).send(new DefaultErrorResponse(err));
    return next(err);
  }
  private serverName = 'Express Plus API';
  private routes = new Array<string>();

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

      if (options.errorHandler) {
        this.errorHandler = options.errorHandler;
      }
    }
  }

  public start() {
    this.registerControllers(this.controllers);

    this.app.get('/', (req, res) => {
      this.routes.sort((a, b) => a > b ? 1 : a < b ? -1 : 0);
      let routeTable = '';
      this.routes.forEach(r => routeTable += r + ' <br>');
      res.send(
        routeMapTemplate.replace('{{title}}', this.serverName)
          .replace('{{routeMap}}', routeTable)
      );
    });

    this.app.listen(environment.PORT, () => {
      console.log('Listening on port ' + environment.PORT);
    });
  }

  private registerControllers(controllers: ApiController[]) {
    for (const controller of controllers) {
      if (this.hasControllerDecorator(controller)) {

        for (const endpoint of controller.endpoints) {
          const route = '/' + controller.getRoute() + '/' + endpoint.route;

          if (endpoint.type === HttpRequestType.GET) {
            console.log("endpoint added at: " + route);
            this.routes.push(route);
            const contextFn = this.createContextFn(endpoint);
            this.app.get(route, contextFn);
          } else if (endpoint.type === HttpRequestType.POST) {
            console.dir("endpoint added at: " + route);
            this.routes.push(route);
            const contextFn = this.createContextFn(endpoint);
            const formatMiddleware = this.getMiddleware(endpoint);
            this.app.post(route, formatMiddleware, contextFn);
          }
        }

      } else {
        throw new Error('Controllers must be denoted by the @Controller() decorator');
      }
    }
  }

  private hasControllerDecorator(controller: ApiController) {
    const keys = Reflect.getMetadataKeys(controller);
    for (const key of keys) {
      if (typeof key === 'string') {
        if (key.indexOf(MetadataKeys.controller) !== -1) {
          return true;
        }
      }
    }
    return false;
  }

  private createContextFn(endpoint: ApiEndpoint) {
    return (req: Request<Dictionary<string>>, res: Response, next: NextFunction) => {
      const context = new HttpContext(req, res, next);

      // POST
      if (endpoint.type === HttpRequestType.POST && endpoint.options instanceof HttpPostOptions && endpoint.options.fromBody) {
        const schemaErrors = SchemaValidator.ValidateBody(req, endpoint.options.fromBody);
        console.log(schemaErrors);
        if (schemaErrors) {

          // Schema error handling
          const err = new Error(schemaErrors);
          if (endpoint.options.errorHandler) {
            endpoint.options.errorHandler(err, req, res, next);
          } else {
            this.errorHandler(err, req, res, next);
          }

        }
      }

      // Pass the context onto the endpoint function and handle the errors accordingly
      endpoint.fn(context).then(() => next()).catch(err => {
        if (endpoint.options && endpoint.options.errorHandler) {
          endpoint.options.errorHandler(err, req, res, next);
        } else {
          this.errorHandler(err, req, res, next);
        }
      });
    };
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
