import cors from 'cors';
import express from 'express';
import { Dictionary, NextFunction, Request, Response } from 'express-serve-static-core';
import multer from 'multer';

import { ControllerOptions } from './decorators/controller.decorator';
import {
    HttpContentType, HttpPostOptions, HttpPutOptions, HttpRequestType, IHttpEndpointOptions,
    IHttpPostOptions, IHttpTypeParameters
} from './decorators/http-types.decorator';
import { DefaultErrorFn } from './error-handlers';
import { routeMapTemplate } from './lib/html/route-map.html';
import { MetadataKeys } from './lib/metadata-keys';
import { Utils } from './lib/utils';
import { SchemaValidator } from './lib/validators/schema-validator';
import { NoContent } from './return-types';

export interface IServerEnvironment {
  port: string;
  debug: boolean;
}

export class ServerEnvironment implements IServerEnvironment {
  port: string = process.env.PORT || '80';
  debug: boolean = process.env.NODE_ENV === 'development';
  constructor(init?: Partial<IServerEnvironment>) {
    if (init) {
      if (init.port) { this.port = init.port };
      if (init.debug) { this.debug = init.debug };
    }
  }
}

export class HttpContext {
  public req: Request<Dictionary<string>>;
  public res: Response;
  [key: string]: any;

  constructor(req: Request<Dictionary<string>>, res: Response, next: NextFunction) {
    this.req = req;
    this.res = res;
  }
}

export interface IApiEndpoint {
  route: string;
  type: HttpRequestType;
  fn: (context: HttpContext) => Promise<any>;
  options?: IHttpEndpointOptions | IHttpPostOptions;
}

export class ApiEndpoint implements IApiEndpoint {
  public route: string;
  public type: HttpRequestType;
  public fn: (context: HttpContext) => Promise<any>;
  public options?: IHttpEndpointOptions | IHttpPostOptions;

  constructor(init?: IApiEndpoint) {
    this.route = init ? init.route : '';
    this.type = init ? init.type : HttpRequestType.GET;
    this.fn = init ? init.fn : Promise.resolve;
    this.options = init && init.options ? init.options : undefined;
  }
}

export interface IApiController {
  readonly endpoints: IApiEndpoint[];
  default: (context: HttpContext) => Promise<any>;
}

export class ApiController implements IApiController {
  public readonly endpoints: ApiEndpoint[];

  constructor() {
    // console.log('ControllerConstructor called');
    this.endpoints = [];

    const metadataKeys: string[] = Reflect.getMetadataKeys(this);
    // console.log(metadataKeys);
    for (const key of metadataKeys) {
      const keyVal: IHttpTypeParameters = Reflect.getMetadata(key, this);
      if (key.indexOf('endpoint:') !== -1 && keyVal.type) {
        const fnName = key.split('endpoint:')[1];
        this.endpoints.push(new ApiEndpoint({
          fn: this[fnName as Extract<keyof this, string>] as any,
          options: keyVal.options ? keyVal.options : undefined,
          route: keyVal.options && keyVal.options.route ? keyVal.options.route : fnName,
          type: keyVal.type,
        }));
      }
    }

    if (this.default) {
      this.endpoints.push(new ApiEndpoint({
        fn: this.default,
        route: '',
        type: HttpRequestType.GET,
      }));
    }

    console.log(this);
  }
  public async default({ req, res }: HttpContext) {
    return NoContent(res);
  }

  public getRoute(): string {
    const constructorName: string = Object.getPrototypeOf(this).constructor.name;

    const metadata: ControllerOptions = Reflect.getMetadata(MetadataKeys.controller + constructorName, this);
    if (metadata && metadata.route) {
      return metadata.route;
    } else {

      const index = constructorName.indexOf('Controller');

      if (constructorName && index) {
        const arr = constructorName.split('Controller');
        // console.log(arr);
        return arr[0];
      } else {
        throw new Error('Cannot implicitly determine a controller route. Please specify a route within the @Controller decorator, or ensure "Controller" appears in the class instance name.');
      }
    }
  }
}
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