import { ApiServer } from "../src/api-server";
import { TestController } from "./controllers/test.controller";
import { ProductsController } from "./controllers/products-controller";

const server = new ApiServer({ debug: true, port: '8000' }, {
  controllers: [
    ProductsController
  ]
});
const endpoint = 'http://localhost:8000/Test/TestGet';

server.app.get('/asd', (req, res, next) => {
  const err = new Error('Test');
  next(err);
});

server.start();
