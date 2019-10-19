import express from 'express';
import { environment } from '../environments/environment';
import { Dictionary } from 'express-serve-static-core';
import { HelloWorldController } from './controllers/hello-world.controller';
import { ApiController } from '../core/controller';
import { Request, Response } from "express-serve-static-core";
import "reflect-metadata";
import { SchemaValidator } from '../core/validators/schema-validator';

export class Server {
  public static app = express();
  public static start() {

    this.app.get('/', (req, res) => {
      res.send('Hello World');
    });

    const controller = new HelloWorldController();
    this.registerControllers(controller);

    // this.app.use((vars) => {
    //   console.log(vars.);
    // });

    this.app.listen(environment.PORT, () => {
      console.log('Listening on port ' + environment.PORT);
    });
  }

  private static registerControllers(...controllers: ApiController[]) {
    for (const controller of controllers) {
      for (const endpoint of controller.endpoints) {
        const route = '/' + controller.routePrefix + '/' + endpoint.route;
        if (endpoint.type === 'GET') {
          console.log('endpoint added at: ' + route);
          this.app.get(route, endpoint.fn);
        } else if (endpoint.type === 'POST') {
          const validationFn = (req: Request<string[]>, res: Response) => {
            if (endpoint.bodyType) {
              SchemaValidator.ValidateBody(req, endpoint.bodyType);
            }
            endpoint.fn(req, res)
          }
          console.log('endpoint added at: ' + route);
          this.app.post(route, validationFn);
        }
      }
    }
  }
}

