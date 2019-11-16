import { Server } from '../index';
import { TestController } from './controllers/test.controller';

const server = new Server({ debug: true, port: '8000' }, {
  controllers: [
    TestController
  ]
});

server.start();