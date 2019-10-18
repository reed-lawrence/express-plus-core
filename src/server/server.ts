import express from 'express';
import { environment } from '../environments/environment';
import { Dictionary } from 'express-serve-static-core';
import { HelloWorldController } from './controllers/hello-world.controller';
import { ApiController } from './controllers/controller';
import "reflect-metadata";

export class Server {
  public static app = express();
  public static start() {

    this.app.get('/', (req, res) => {
      res.send('Hello World');
    });

    const controller = new HelloWorldController();
    this.registerControllers(controller);

    this.app.listen(environment.PORT, () => {
      console.log('Listening on port ' + environment.PORT);
    });
  }

  private static registerControllers(...controllers: ApiController[]) {
    for (const controller of controllers) {
      for (const endpoint of controller.endpoints) {
        if (endpoint.type === 'GET') {
          const route = '/' + controller.routePrefix + '/' + endpoint.route;
          console.log('endpoint added at: ' + route);
          this.app.get(route, endpoint.fn);
        }
      }
    }
  }
}

