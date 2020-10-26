import { ApiServer } from "../src/api-server";
import { ProductsController } from "./controllers/products-controller";
import { TestController } from "./controllers/test.controller";

const server = new ApiServer({ debug: true, port: '8000' }, {
  controllers: [
    TestController,
  ],
});

// @ts-ignore
server.registerControllers();
