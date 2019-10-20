import express from 'express';
import { environment } from '../environments/environment';
import { Dictionary, NextFunction } from 'express-serve-static-core';
import { HelloWorldController } from './controllers/hello-world.controller';
import { ApiController } from '../core/controller';
import { Request, Response } from "express-serve-static-core";
import "reflect-metadata";
import { SchemaValidator } from '../core/validators/schema-validator';
import { HttpContext } from '../core/http-context';

export class Server {
  public static app = express();
  public static start() {

    this.app.use(express.json());

    this.app.get('/', (req, res) => {
      res.send('Hello World');
    });

    const controller = new HelloWorldController();
    this.registerControllers(controller);

    this.app.listen(environment.PORT, () => {
      console.log('Listening on port ' + environment.PORT);
    });
  }

  private static registerControllers<T>(...controllers: ApiController<T>[]) {
    for (const controller of controllers) {
      for (const endpoint of controller.endpoints) {
        const route = '/' + controller.routePrefix + '/' + endpoint.route;
        if (endpoint.type === 'GET') {
          console.log('endpoint added at: ' + route);
          const validationFn = (req: Request<Dictionary<string>>, res: Response, next: NextFunction) => {
            const context = new HttpContext(req, res, next);
            endpoint.fn(context);
          }
          this.app.get(route, validationFn);
        } else if (endpoint.type === 'POST') {
          const validationFn = (req: Request<Dictionary<string>>, res: Response, next: NextFunction) => {
            const context = new HttpContext(req, res, next);
            if (endpoint.bodyType) {
              SchemaValidator.ValidateBody(req, endpoint.bodyType);
            }
            endpoint.fn(context)
          }
          console.log('endpoint added at: ' + route);
          this.app.post(route, validationFn);
        }
      }
    }
  }
}

