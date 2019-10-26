import 'reflect-metadata';

import express, { RequestHandler } from 'express';
import { Dictionary, NextFunction, Request, Response } from 'express-serve-static-core';
import multer from 'multer';

import { environment } from '../environments/environment';
import { ApiEndpoint } from './api-endpoint';
import { ApiController } from './controller';
import { HttpContentType } from './decorations/http-types/http-content-type.enum';
import { HttpPostOptions } from './decorations/http-types/http-post';
import { HttpRequestType } from './decorations/http-types/http-request-type.enum';
import { ApplicationError } from './error-handling/application-error';
import { DefaultErrorResponse } from './error-handling/default-error-response';
import { NotFoundError } from './error-handling/not-found-error';
import { routeMapTemplate } from './html/route-map.html';
import { HttpContext } from './http-context';
import { MetadataKeys } from './metadata-keys';
import { Utils } from './utils';
import { SchemaValidator } from './validators/schema-validator';

export interface IServerOptions {
  controllers: Array<(new () => ApiController)>;
  routePrefix?: string;
  errorHandler?: (err: any, req: Request<Dictionary<string>>, res: Response, next: NextFunction) => any;
  authMethod?: (req: Request<Dictionary<string>>, res: Response, next: NextFunction) => Promise<HttpContext>;
}

export class Server {
  // Main server
  private app = express();

  // Multipart/form-data
  private multer = multer();

  private controllers: ApiController[] = [];
  private readonly routePrefix?: string;
  private readonly serverName = 'Express Plus API';
  private routes = new Array<{ route: string, type: 'GET' | 'POST' | 'PUT' | 'DELETE', endpoint: ApiEndpoint }>();
  private readonly authMethod?: (
    req: Request<Dictionary<string>>,
    res: Response,
    next: NextFunction) => Promise<HttpContext>;

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

      if (options.authMethod) {
        this.authMethod = options.authMethod;
      }
    }
  }

  public start() {
    this.registerControllers(this.controllers);

    this.app.get('/', (req, res) => {
      this.buildRouteTable().then(table => {
        res.send(table);
      });
    });

    this.app.use((req, res, next) => {
      this.errorHandler(new NotFoundError(), req, res, next);
    });

    this.app.listen(environment.PORT, () => {
      console.log('Listening on port ' + environment.PORT);
    });
  }
  private readonly errorHandler = (
    err: Error | ApplicationError,
    req: Request<Dictionary<string>>,
    res: Response,
    next: NextFunction) => {
    const status = err instanceof ApplicationError ? err.status : 500;
    res.status(status).send(new DefaultErrorResponse(err));
    return next(err);
  }

  private registerControllers(controllers: ApiController[]) {
    for (const controller of controllers) {
      if (this.hasControllerDecorator(controller)) {

        for (const endpoint of controller.endpoints) {
          const route = '/' + controller.getRoute() + '/' + endpoint.route;

          const middleware: (express.RequestHandler)[] = new Array();
          if (endpoint.options && endpoint.options.authenticate) {
            let authMethod: (req: Request<Dictionary<string>>, res: Response, next: NextFunction) => Promise<any>;
            if (endpoint.options.authMethod) {
              authMethod = endpoint.options.authMethod;
            } else if (this.authMethod) {
              authMethod = this.authMethod;
            } else {
              throw new Error('Unable to register route. Authenticate was specified in ' +
                'the controller endpoint, but no authentication method was provided by the server or endpoint');
            }

            // Wrapper for unified/customized error handling
            middleware.push((req, res, next) => {
              authMethod(req, res, next).then(() => next()).catch((err) => {
                if (endpoint.options && endpoint.options.errorHandler) {
                  endpoint.options.errorHandler(err, req, res, next);
                } else {
                  this.errorHandler(err, req, res, next);
                }
              });
            });
          }

          // This is the function that gets passed to the final controller endpoint
          const contextFn = this.createContextFn(endpoint);

          if (endpoint.type === HttpRequestType.GET) {
            console.log("endpoint added at: " + route);
            this.routes.push({ route, type: 'GET', endpoint: endpoint });
            this.app.get(route, middleware, contextFn);
          } else if (endpoint.type === HttpRequestType.POST) {
            console.dir("endpoint added at: " + route);
            this.routes.push({ route, type: 'POST', endpoint: endpoint });
            middleware.push(this.getFormatMiddleware(endpoint));
            this.app.post(route, middleware, contextFn);
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
      if (endpoint.type === HttpRequestType.POST &&
        endpoint.options instanceof HttpPostOptions &&
        endpoint.options.fromBody) {
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
      endpoint.fn(context).then(() => next()).catch((err) => {
        if (endpoint.options && endpoint.options.errorHandler) {
          endpoint.options.errorHandler(err, req, res, next);
        } else {
          this.errorHandler(err, req, res, next);
        }
      });
    };
  }

  private getFormatMiddleware(endpoint: ApiEndpoint) {
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

  private async buildRouteTable() {
    this.routes.sort((a, b) => a.route > b.route ? 1 : a.route < b.route ? -1 : 0);
    let table = '<table><tr><th>Request Type</th><th>Route</th><th>Details</th></tr>{{tablebody}}</table>';
    let tableBody = '';
    const endpointRowTemplate = '<tr><td>{{type}}</td><td>{{route}}</td><td>{{details}}</td></tr>';
    for (const route of this.routes) {
      let detailcell = '';
      if (route.endpoint.options) {
        if (route.endpoint.options.authenticate) {
          detailcell += '<p>Authentication required</p>';
        }
        if (route.endpoint.options.authMethod) {
          detailcell += '<p>Authentication method overwritten</p>';
        }
        if (route.endpoint.options.errorHandler) {
          detailcell += '<p>Error handling method overwritten</p>';
        }
        if (route.endpoint.options instanceof HttpPostOptions) {
          if (route.endpoint.options.contentType) {
            detailcell += '<p>Request type: ' + route.endpoint.options.contentType.toString() + '</p>';
          }

          if (route.endpoint.options.fromBody) {
            if (route.endpoint.options.fromBody instanceof Function) {
              detailcell += '<p>Body model: ' + JSON.stringify(new route.endpoint.options.fromBody()) + '</p>';
            } else {
              detailcell += '<p>Body model: ' + JSON.stringify(route.endpoint.options.fromBody) + '</p>';
            }
          }
        }
      }
      tableBody += endpointRowTemplate
        .replace('{{type}}', route.type)
        .replace('{{route}}', route.route)
        .replace('{{details}}', detailcell);
    }


    return routeMapTemplate.replace('{{routeMap}}', table.replace('{{tablebody}}', tableBody));
  }
}
