import "reflect-metadata";

import { TestAuth } from "./classes/test-auth";
import { Server } from "./core/server";
import { HelloWorldController } from "./server/controllers/hello-world.controller";
import { ServerEnvironment } from "./core/environment";

const environment = new ServerEnvironment({
  port: '8000',
  debug: true
});

const server = new Server(
  environment,
  {
    controllers: [
      HelloWorldController
    ],
    authMethod: TestAuth,
    cors: {
      origin: ['https://www.mysite.com']
    }
  });

server.start();
