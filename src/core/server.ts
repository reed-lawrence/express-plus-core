import 'reflect-metadata';

import express from 'express';
import { Dictionary, NextFunction, Request, Response } from 'express-serve-static-core';
import multer from 'multer';
import cors from 'cors';

import { IServerEnvironment } from './environment';
import { ApiEndpoint } from './api-endpoint';
import { ApiController } from './controller';
import { HttpContentType } from './decorators/http-types/http-content-type.enum';
import { HttpPostOptions } from './decorators/http-types/http-post';
import { HttpRequestType } from './decorators/http-types/http-request-type.enum';
import { routeMapTemplate } from './html/route-map.html';
import { HttpContext } from './http-context';
import { MetadataKeys } from './metadata-keys';
import { Utils } from './utils';
import { SchemaValidator } from './validators/schema-validator';
import { HttpPutOptions } from './decorators/http-types/http-put';
import { DefaultErrorFn } from './error-handling/default-error-fn';

export interface IServerOptions {
  controllers: Array<(new () => ApiController)>;
  routePrefix?: string;
  errorHandler?: (err: any, req: Request<Dictionary<string>>, res: Response, next: NextFunction) => any;
  authMethod?: (req: Request<Dictionary<string>>, res: Response, next: NextFunction) => Promise<void>;
  cors?: cors.CorsOptions;
}

export class Server {
  // Main server
  private app = express();

  // Multipart/form-data
  private multer = multer();

  /**
   * Array of ApiControllers to handle
   */
  private controllers: ApiController[] = new Array<ApiController>();

  /**
   * Route prefix to prepend to each controller/endpoint route
   */
  private readonly routePrefix?: string = '';

  /**
   * Name of the server to display upon getting runtime info
   */
  private readonly serverName = 'Express Plus API';

  /**
   * Array of routes to be listened to by the underlying express instance
   */
  private routes = new Array<{ route: string, type: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'CONNECT' | 'HEAD' | 'TRACE' | 'OPTIONS', endpoint: ApiEndpoint }>();

  /**
   * The default authentication method to be called by endpoints requiring authentication
   */
  private readonly authMethod?: (
    req: Request<Dictionary<string>>,
    res: Response,
    next: NextFunction) => Promise<void>;

  /**
   * The default error handler to intercept and handle all application errors
   */
  private readonly errorHandler = DefaultErrorFn;

  /**
   * The server port to listen on
   */
  private readonly port: string = '80';

  /**
   * The server debug state
   */
  private readonly debug: boolean = false;

  private readonly cors?: cors.CorsOptions;

  constructor(env: IServerEnvironment, options?: IServerOptions) {
    this.port = env.port;
    this.debug = env.debug;
    if (options) {
      if (options.controllers) {
        for (const controllerConst of options.controllers) {
          this.controllers.push(new controllerConst());
        }
      }

      if (options.routePrefix) {
        this.routePrefix = '/' + Utils.trimRoute(options.routePrefix);
      }

      if (options.errorHandler) {
        this.errorHandler = options.errorHandler;
      }

      if (options.authMethod) {
        this.authMethod = options.authMethod;
      }

      if (options.cors) {
        this.cors = options.cors;
      }
    }
  }

  /**
   * Start the server instance
   */
  public start() {
    this.registerControllers(this.controllers);

    if (this.debug) {
      console.log('Server is in debug mode');
      this.app.get('/', (req, res) => {
        this.buildRouteTable().then(table => {
          res.send(table);
        });
      });
    }

    this.app.listen(this.port, () => {
      console.log(`Listening on port ${this.port}`);
    });
  }

  private registerControllers(controllers: ApiController[]) {
    for (const controller of controllers) {
      if (this.hasControllerDecorator(controller)) {

        for (const endpoint of controller.endpoints) {
          const route = `${this.routePrefix}/${controller.getRoute()}/${endpoint.route}`;

          const middleware: (express.RequestHandler)[] = new Array();

          // CORS middleware
          if (endpoint.options && endpoint.options.cors !== undefined) {
            if (typeof endpoint.options.cors === 'object') {
              middleware.push(cors(endpoint.options.cors));
            } else if (endpoint.options.cors === false) {
              // if endpoint.options.cors is explicitly false then don't register any cors policy to this route
              console.log(`Cors policy explicitly ignored for route: ${route}`);
            }
          } else if (this.cors) {
            middleware.push(cors(this.cors));
          }

          // Authentication middleware
          if (endpoint.options && endpoint.options.authenticate) {

            let authMethod: (req: Request<Dictionary<string>>, res: Response, next: NextFunction) => Promise<any>;

            if (endpoint.options.authMethod) {
              authMethod = endpoint.options.authMethod;
            } else if (this.authMethod) {
              authMethod = this.authMethod;
            } else {
              throw new Error(`Unable to register route. Authenticate was specified in the controller endpoint, 
              but no authentication method was provided by the server or endpoint`);
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

          // Register routes
          if (endpoint.type === HttpRequestType.GET) {

            console.log(`endpoint added at: ${route}`);
            this.routes.push({ route: route, type: 'GET', endpoint: endpoint });
            this.app.get(route, middleware, contextFn);

          } else if (endpoint.type === HttpRequestType.POST) {

            console.log(`endpoint added at: ${route}`);
            this.routes.push({ route: route, type: 'POST', endpoint: endpoint });
            middleware.push(this.getFormatMiddleware(endpoint));
            this.app.post(route, middleware, contextFn);

          } else if (endpoint.type === HttpRequestType.PUT) {

            console.log(`endpoint added at: ${route}`);
            this.routes.push({ route: route, type: 'PUT', endpoint: endpoint });
            middleware.push(this.getFormatMiddleware(endpoint));
            this.app.put(route, middleware, contextFn);

          } else if (endpoint.type === HttpRequestType.DELETE) {

            console.log(`endpoint added at: ${route}`);
            this.routes.push({ route: route, type: 'DELETE', endpoint: endpoint });
            this.app.delete(route, middleware, contextFn);

          } else if (endpoint.type === HttpRequestType.CONNECT) {

            console.log(`endpoint added at: ${route}`);
            this.routes.push({ route: route, type: 'CONNECT', endpoint: endpoint });
            this.app.connect(route, middleware, contextFn);

          } else if (endpoint.type === HttpRequestType.HEAD) {

            console.log(`endpoint added at: ${route}`);
            this.routes.push({ route: route, type: 'HEAD', endpoint: endpoint });
            this.app.head(route, middleware, contextFn);

          } else if (endpoint.type === HttpRequestType.OPTIONS) {

            console.log(`endpoint added at: ${route}`);
            this.routes.push({ route: route, type: 'OPTIONS', endpoint: endpoint });
            this.app.options(route, middleware, contextFn);

          } else if (endpoint.type === HttpRequestType.TRACE) {

            console.log(`endpoint added at: ${route}`);
            this.routes.push({ route: route, type: 'TRACE', endpoint: endpoint });
            this.app.trace(route, middleware, contextFn);

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

      // POST & PUT
      if ((endpoint.type === HttpRequestType.POST || endpoint.type === HttpRequestType.PUT) &&
        (endpoint.options instanceof HttpPostOptions || endpoint.options instanceof HttpPutOptions) &&
        endpoint.options.fromBody) {
        const schemaErrors = SchemaValidator.ValidateBody(req, endpoint.options.fromBody);
        console.log(schemaErrors);
        if (schemaErrors) {

          // Schema error handling
          const err = new Error(schemaErrors);
          if (endpoint.options.errorHandler) {
            return endpoint.options.errorHandler(err, req, res, next);
          } else {
            // this.errorHandler(err, req, res, next);
            return this.errorHandler(err, req, res, next);
          }

        }
      }

      // Pass the context onto the endpoint function and handle the errors accordingly
      return endpoint.fn(context).then(() => next()).catch((err) => {
        if (endpoint.options && endpoint.options.errorHandler) {
          return endpoint.options.errorHandler(err, req, res, next);
        } else {
          return this.errorHandler(err, req, res, next);
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
