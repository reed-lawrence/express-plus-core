import "reflect-metadata";

import { HelloWorldController } from "./server/controllers/hello-world.controller";
import { Server } from "./core/server";

const server = new Server(
  {
    controllers: [
      HelloWorldController,
    ]
  });

server.start();
