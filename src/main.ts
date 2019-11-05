import "reflect-metadata";

import { TestAuth } from "./classes/test-auth";
import { Server } from "./core/server";
import { HelloWorldController } from "./server/controllers/hello-world.controller";

const server = new Server(
  {
    controllers: [
      HelloWorldController
    ],
    authMethod: TestAuth
  });

server.start();
