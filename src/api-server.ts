import cors from 'cors';
import express from 'express';
import { Dictionary, NextFunction, Request, Response } from 'express-serve-static-core';
import http from 'http';
import multer from 'multer';

import { ApiController } from './api-controller';
import { ApiEndpoint } from './api-endpoint';
import { formDataGuardMiddleware, jsonGuardMiddleware, urlEncodedGuardMiddleware } from './content-type-guards';
import { HttpPostOptions } from './decorators/http-post-options';
import { HttpPutOptions } from './decorators/http-put-options';
import { HttpContentType, HttpRequestType } from './decorators/http-types.decorator';
import { DefaultErrorFn } from './error-handlers/default-err-fn';
import { routeMapTemplate } from './html/route-map.html';
import { HttpContext } from './http-context';
import { MetadataKeys } from './metadata-keys';
import { IServerEnvironment } from './server-environment';
import { Utils } from './utils';
import { SchemaValidator } from './validators/schema-validator';

export const ServerErrorMessages = {
  invalidController: 'Controllers must be denoted by the @Controller() decorator',
  invalidRoute: 'Unable to register route. Authenticate was specified in the controller endpoint, but no authentication method was provided by the server or endpoint',
};

export interface IServerOptions {
  controllers: Array<(new () => ApiController)>;
  routePrefix?: string;
  errorHandler?: (err: any, req: Request<Dictionary<string>>, res: Response, next: NextFunction) => any;
  authMethod?: (req: Request<Dictionary<string>>, res: Response, next: NextFunction) => Promise<void>;
  cors?: cors.CorsOptions;
  logging?: 'verbose' | 'none';
}

export class ApiServer {

  /**
   * Main express() instance used for the ApiServer
   */
  public app = express();

  /**
   * The HTTP server instance created by the express app.listen() method
   */
  public server: http.Server | undefined;

  // Multipart/form-data
  private multer = multer();

  /**
   * Array of ApiControllers to handle
   */
  public readonly controllers: ApiController[] = new Array<ApiController>();

  /**
   * Route prefix to prepend to each controller/endpoint route
   */
  public readonly routePrefix?: string = '';

  /**
   * Name of the server to display upon getting runtime info
   */
  public readonly serverName = 'Express Plus API';

  /**
   * Array of routes to be listened to by the underlying express instance
   */
  public readonly routes = new Array<{ route: string, type: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'CONNECT' | 'HEAD' | 'TRACE' | 'OPTIONS', endpoint: ApiEndpoint }>();

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
  private readonly errorHandler: express.ErrorRequestHandler = DefaultErrorFn;

  /**
   * The server port to listen on
   */
  public readonly port: string = '80';

  /**
   * The server debug state
   */
  public readonly debug: boolean = false;

  private readonly cors?: cors.CorsOptions;

  public readonly logging: 'verbose' | 'none' = 'none';

  constructor(env: IServerEnvironment, options?: IServerOptions) {
    this.port = env.port;
    this.debug = env.debug;
    if (options) {
      if (options.controllers) {
        let controllerId = 1;
        for (const controllerConstructor of options.controllers) {
          this.controllers.push(new controllerConstructor());
          this.controllers[this.controllers.length - 1].controller_id = controllerId;
          controllerId++;
        }
      }

      if (options.logging) { this.logging = options.logging; }

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
  public async start() {
    return new Promise<void>(async (resolve) => {
      await this.registerControllers(this.controllers);

      if (this.debug) {
        if (this.logging === 'verbose') {
          console.log('Server is in debug mode');
        }
        this.app.get('/', (req, res) => {
          // this.buildRouteTable().then((table) => {
          //   res.send(table);
          // });
          res.send(JSON.stringify(this.routes));
        });
      }

      this.server = this.app.listen(this.port, () => {
        if (this.logging === 'verbose') {
          console.log(`Listening on port ${this.port}`);
        }
        resolve();
      });
    });
  }

  public stop() {
    if (this.server) {
      this.server.close();
    } else {
      throw new Error('Cannot stop server instance that is not running');
    }
    return;
  }

  private async registerControllers(controllers: ApiController[]) {
    for (const controller of controllers) {
      if (this.hasControllerDecorator(controller)) {
        controller.registerEndpoints();

        for (const endpoint of controller.endpoints) {
          let route = `${this.routePrefix}/${controller.getRoute()}`;
          if (endpoint.route) {
            route += `/${endpoint.route}`;
          }
          if (endpoint.options && endpoint.options.params) {
            route += `/${Utils.trimRoute(endpoint.options.params)}`;
          }

          const middleware: Array<express.RequestHandler | express.ErrorRequestHandler> = new Array();

          // CORS middleware
          if (endpoint.options && endpoint.options.cors !== undefined) {
            if (typeof endpoint.options.cors === 'object') {
              middleware.push(cors(endpoint.options.cors));
            } else if (endpoint.options.cors === false) {
              // if endpoint.options.cors is explicitly false then don't register any cors policy to this route
              if (this.logging === 'verbose') {
                console.log(`Cors policy explicitly ignored for route: ${route}`);
              }
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
              throw new Error(ServerErrorMessages.invalidRoute);
            }

            // Wrapper for unified/customized error handling
            middleware.push(authMethod);
          }

          if (endpoint.options && (endpoint.options instanceof HttpPostOptions || endpoint.options instanceof HttpPutOptions)) {
            const contentTypeGuard = this.getContentTypeGuard(endpoint);
            if (contentTypeGuard) {
              middleware.push(contentTypeGuard);
            }

            middleware.push(this.getFormatMiddleware(endpoint));

            if (endpoint.options.fromBody) {
              middleware.push(this.getFromBodyFn(endpoint));
            }
          }

          // Error handler
          const errorHandler = endpoint.options && endpoint.options.errorHandler ? endpoint.options.errorHandler : this.errorHandler;

          // This is the function that gets passed to the final controller endpoint
          const contextFn = await this.createContextFn(controller, endpoint);

          // Register routes
          if (endpoint.type === HttpRequestType.GET) {

            this.routes.push({ route, type: 'GET', endpoint });
            this.app.get(route, middleware, errorHandler, contextFn);

          } else if (endpoint.type === HttpRequestType.POST) {

            this.routes.push({ route, type: 'POST', endpoint });
            this.app.post(route, middleware, errorHandler, contextFn);

          } else if (endpoint.type === HttpRequestType.PUT) {

            this.routes.push({ route, type: 'PUT', endpoint });
            this.app.put(route, middleware, errorHandler, contextFn);

          } else if (endpoint.type === HttpRequestType.DELETE) {

            this.routes.push({ route, type: 'DELETE', endpoint });
            this.app.delete(route, middleware, errorHandler, contextFn);

          } else if (endpoint.type === HttpRequestType.CONNECT) {

            this.routes.push({ route, type: 'CONNECT', endpoint });
            this.app.connect(route, middleware, errorHandler, contextFn);

          } else if (endpoint.type === HttpRequestType.HEAD) {

            this.routes.push({ route, type: 'HEAD', endpoint });
            this.app.head(route, middleware, errorHandler, contextFn);

          } else if (endpoint.type === HttpRequestType.OPTIONS) {

            this.routes.push({ route, type: 'OPTIONS', endpoint });
            this.app.options(route, middleware, errorHandler, contextFn);

          } else if (endpoint.type === HttpRequestType.TRACE) {

            this.routes.push({ route, type: 'TRACE', endpoint });
            this.app.trace(route, middleware, errorHandler, contextFn);

          }
        }

        if (this.logging === 'verbose') {
          for (const route of this.routes) {
            console.log(`Route added: [${route.type}] ${route.route}`);
          }
        }

      } else {
        throw new Error(ServerErrorMessages.invalidController);
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

  private getFromBodyFn(endpoint: ApiEndpoint) {
    return (req: Request<Dictionary<string>>, res: Response, next: NextFunction) => {
      // POST & PUT
      if ((endpoint.type === HttpRequestType.POST || endpoint.type === HttpRequestType.PUT) &&
        (endpoint.options instanceof HttpPostOptions || endpoint.options instanceof HttpPutOptions) &&
        endpoint.options.fromBody) {

        SchemaValidator.ValidateBody(req, endpoint.options.fromBody).then((schemaErrors) => {
          // Schema error handling
          if (schemaErrors) {
            return next(new Error(schemaErrors));
          } else {
            return next();
          }
        });
      } else {
        return next();
      }
    };
  }

  private createContextFn<C extends ApiController>(controller: C, endpoint: ApiEndpoint) {
    // Get the index of the corresponding controller
    // Do this, because otherwise creating a generic function messes with the `this` property in the controller
    let cIndex = this.controllers.findIndex(c => c.controller_id === controller.controller_id);
    if (cIndex === -1) {
      throw new Error('Unable to find matching controller corresponding to endpoint');
    }

    if (!endpoint.fnName) {
      throw new Error('endpoint funtion name is not defined');
    }

    if (typeof this.controllers[cIndex][endpoint.fnName] !== 'function') {
      const protoName = this.controllers[cIndex].prototype.name;
      throw new Error(`The endpoint function ${endpoint.fnName} on ${protoName} is not a function`);
    }

    // Return a new function that accepts the expexted express arguments
    return (req: Request<Dictionary<string>>, res: Response, next: NextFunction) => {

      // When called, pass the express arguments into an HttpContext and pass that into the mapped fn
      const fnResult = this.controllers[cIndex][endpoint.fnName as string](new HttpContext(req, res, next));

      // Check if the function is returning an async promise
      if (fnResult instanceof Promise) {

        // Handle the errors or pass the function on
        fnResult.then(() => next()).catch((err) => {
          if (endpoint.options && endpoint.options.errorHandler) {
            return endpoint.options.errorHandler(err, req, res, next);
          } else {
            return this.errorHandler(err, req, res, next);
          }
        });
      } else {
        console.warn(`function at ${endpoint.fnName} is performing synchronously`);
      }
    }
  }

  private getContentTypeGuard(endpoint: ApiEndpoint) {
    let contentTypeGuard: express.RequestHandler | undefined;
    if (endpoint.options && (endpoint.options instanceof HttpPostOptions || endpoint.options instanceof HttpPutOptions) && endpoint.options.contentType) {
      switch (endpoint.options.contentType) {
        case HttpContentType.JSON: {
          contentTypeGuard = jsonGuardMiddleware;
          break;
        }
        case HttpContentType.FormData: {
          contentTypeGuard = formDataGuardMiddleware;
          break;
        }
        case HttpContentType.UrlEncoded: {
          contentTypeGuard = urlEncodedGuardMiddleware;
          break;
        }
      }
    }
    return contentTypeGuard;
  }

  private getFormatMiddleware(endpoint: ApiEndpoint) {
    let formatMiddleware: express.RequestHandler = express.json();
    if (endpoint.options) {
      if ((endpoint.options instanceof HttpPostOptions || endpoint.options instanceof HttpPutOptions) && endpoint.options.contentType) {
        switch (endpoint.options.contentType) {
          case HttpContentType.FormData: {
            formatMiddleware = this.multer.none();
            break;
          }
          case HttpContentType.UrlEncoded: {
            formatMiddleware = express.urlencoded({ extended: true });
            break;
          }
        }
      }
    }
    return formatMiddleware;
  }

  private async buildRouteTable() {
    this.routes.sort((a, b) => a.route > b.route ? 1 : a.route < b.route ? -1 : 0);
    const table = '<table><tr><th>Request Type</th><th>Route</th><th>Details</th></tr>{{tablebody}}</table>';
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
