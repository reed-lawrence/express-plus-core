import express from 'express';
import multer from 'multer';
import { environment } from '../environments/environment';
import { Dictionary, NextFunction } from 'express-serve-static-core';
import { HelloWorldController } from './controllers/hello-world.controller';
import { ApiController, IApiController } from '../core/controller';
import { Request, Response } from "express-serve-static-core";
import "reflect-metadata";
import { SchemaValidator } from '../core/validators/schema-validator';
import { HttpContext } from '../core/http-context';
import { HttpRequestType } from '../core/decorations/http-types/http-request-type.enum';
import { HttpPostOptions } from '../core/decorations/http-types/http-post';
import { ApiEndpoint } from '../core/api-endpoint';
import { HttpContentType } from '../core/decorations/http-types/http-content-type.enum';

export interface IServerOptions {
  controllers: { new(): ApiController<any> }[]
}

export class Server {
  // Main server
  private app = express();

  // Multipart/form-data
  private multer = multer();

  private controllers: ApiController<any>[] = [];

  constructor(options?: IServerOptions) {
    if (options && options.controllers) {
      for (const controllerConst of options.controllers) {
        this.controllers.push(new controllerConst());
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

  private registerControllers<T>(controllers: ApiController<T>[]) {
    for (const controller of controllers) {
      for (const endpoint of controller.endpoints) {
        const route = '/' + controller.routePrefix + '/' + endpoint.route;
        if (endpoint.type === HttpRequestType.GET) {
          console.log('endpoint added at: ' + route);
          const contextFn = (req: Request<Dictionary<string>>, res: Response, next: NextFunction) => {
            const context = new HttpContext(req, res, next);
            endpoint.fn(context);
          }
          this.app.get(route, contextFn);
        } else if (endpoint.type === HttpRequestType.POST) {
          const validationFn = (req: Request<Dictionary<string>>, res: Response, next: NextFunction) => {
            const context = new HttpContext(req, res, next);
            if (endpoint.options instanceof HttpPostOptions && endpoint.options.fromBody) {
              SchemaValidator.ValidateBody(req, endpoint.options.fromBody);
            }
            endpoint.fn(context)
          }

          const formatMiddleware = this.getMiddleware(endpoint);
          console.log('endpoint added at: ' + route);
          this.app.post(route, formatMiddleware, validationFn);


        }
      }
    }
  }

  private getMiddleware<T>(endpoint: ApiEndpoint<T>) {
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

