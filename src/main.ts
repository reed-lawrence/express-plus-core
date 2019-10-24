import "reflect-metadata";

import { Server } from "./server/server";
import { HelloWorldController } from "./server/controllers/hello-world.controller";

const server = new Server(
  {
    controllers: [
      HelloWorldController
    ]
  });

server.start();