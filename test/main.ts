import assert, { fail } from 'assert';
import { afterEach, describe, it } from 'mocha';
import 'reflect-metadata';
import request from 'request';
import { ApiServer, LoggingLevel, ServerErrorMessages } from '../src/api-server';
import { ControllerOptions } from '../src/decorators/controller.decorator';
import { HttpRequestType } from '../src/decorators/http-types.decorator';
import { MetadataKeys } from '../src/metadata-keys';
import { IServerEnvironment } from '../src/server-environment';
import { IExampleObject } from './classes/example-object';
import { InvalidAuthRouteController, InvalidController } from './controllers/bad-controllers';
import { CustomRouteController } from './controllers/custom-route.controller';
import { TestController } from './controllers/test.controller';

describe('Controller [Class]', () => {
  it('Should create controller metadata', () => {
    // Arrange
    const controller = new TestController();
    const targetKey = MetadataKeys.controller + 'TestController';

    // Act
    const keys = Reflect.getMetadataKeys(controller);

    // Assert
    assert.equal(keys.indexOf(targetKey) !== -1, true, 'Metadata key not found on controller instance');

  });

  it('Should register all endpoints', async () => {
    // Arrange
    const controller = new TestController();
    const postRoute = 'TestPost';
    const getRoute = 'TestGet';

    // Act
    await controller.registerEndpoints();
    const postEndpoint = controller.endpoints.find((e) => e.route === postRoute);
    const getEndpoint = controller.endpoints.find((e) => e.route === getRoute);

    // Assert
    if (postEndpoint) {
      assert.equal(postEndpoint.type, HttpRequestType.POST, 'Post endpoint not of POST request enum');
      assert.equal(postEndpoint.fnName, controller.TestPost.name, 'Function not bound correctly to POST endpoint');
    } else {
      assert.fail('Post endpoint not created');
    }

    if (getEndpoint) {
      assert.equal(getEndpoint.type, HttpRequestType.GET, 'Post endpoint not of POST request enum');
      assert.equal(getEndpoint.fnName, controller.TestGet.name, 'Function not bound correctly to POST endpoint');
    } else {
      assert.fail('Get endpoint not created');
    }
  });

  it('Should not register non-decorated class methods', () => {
    // Arrange
    const controller = new TestController();

    // Assert
    assert.equal(controller.endpoints.findIndex((e) => e.fnName === controller.shouldNotRegister.name) === -1, true);
  });

  it('Should assign custom route metadata', () => {
    // Arrange
    const controller = new CustomRouteController();

    // Act
    const keys = Reflect.getMetadataKeys(controller);
    const options: ControllerOptions | undefined = Reflect.getMetadata(
      keys.find((k) => k.indexOf(MetadataKeys.controller + 'CustomRouteController') !== -1),
      controller);

    // Assert
    if (options) {
      assert.equal(options.route, 'TestRoute');
    } else {
      assert.fail(`Options not supplied for controller. Keys: ${keys.toString()}`);
    }
  });
});

describe('Server [Class]', () => {
  const env: IServerEnvironment = { port: '8000', debug: true, logging: LoggingLevel.none };
  it('Constructor should register basic params', () => {
    // Arrange + Act
    const server = new ApiServer(env);

    // Assert

    assert.equal(server.port, '8000', 'Port not as expected');

    assert.equal(server.debug, true, 'Debug not set correctly');
  });

  it('Should register endpoints from injected Controllers', async () => {
    // Arrange
    const server = new ApiServer(env, {
      controllers: [TestController],
    });
    const expectedPrefix = 'test';
    const controller = new TestController();

    // Act
    // @ts-ignore
    await server.registerControllers(server.controllers);
    const getEndpoint = server.routes.find((r) => r.route === `/${expectedPrefix}/TestGet`);

    // Assert
    if (getEndpoint) {
      assert.equal(getEndpoint.type === 'GET', true, 'TestGet route not to GET type');

      assert.equal(getEndpoint.endpoint.fnName, controller.TestGet.name, 'Registered route does not have same function instance');
    } else {
      assert.equal(server.routes, [], 'Routes not as expected');
    }
  });

  it('Should not register a controller without a decorator', async () => {
    // Act
    try {
      const server = new ApiServer(env, {
        controllers: [InvalidController],
      });

    } catch (err) {

      // Assert
      assert.equal(err.message, ServerErrorMessages.invalidController);
      return;
    }
    fail('Expexted error to be thrown, left catch block');
  });

  it('Should not register an endpoint if auth required, but none supplied', async () => {
    // Arrange
    const server = new ApiServer(env, {
      controllers: [InvalidAuthRouteController],
    });

    // Act
    try {
      // @ts-ignore
      await server.registerControllers(server.controllers);
    } catch (err) {

      // Assert
      assert.equal(err.message, ServerErrorMessages.invalidRoute);
      return;
    }
    fail('Expexted error to be thrown, left catch block');
  });

  it('Should register an overwritten endpoint route', async () => {
    // Arrange
    const server = new ApiServer(env, {
      controllers: [TestController],
    });

    const expectedRoute = '/test/OverrideRoute';

    // Act
    // @ts-ignore
    await server.registerControllers(server.controllers);
    const route = server.routes.find((r) => r.route === expectedRoute);

    // Assert
    assert.equal(route !== undefined, true, 'Route not registered');
  });

});

describe('Server', () => {
  let server: ApiServer;
  const env: IServerEnvironment = { port: '8000', logging: LoggingLevel.none, debug: true };
  afterEach(() => server.stop());

  it('Should listen on port', (done) => {
    // Arrange
    server = new ApiServer(env, {
      controllers: [],
    });
    const endpoint = `http://localhost:${env.port}/`;

    // Act
    server.start().then(() => {
      request(endpoint, { method: 'GET' }, (err, res, body) => {
        // Assert
        if (err) {
          assert.fail(err);
        } else {
          assert.equal(res.statusCode, 200, 'Status code not as expected');
          assert.equal(body !== undefined, true, 'Body not as expected');
        }

        done();
      });
    });
  });

  it('Should listen on GET route', (done) => {
    // Arrange
    server = new ApiServer(env, {
      controllers: [TestController],
    });
    const endpoint = `http://localhost:${env.port}/Test/TestGet`;
    const expectedBody = 'GET works';

    // Act
    server.start().then(() => {
      request(endpoint, { method: 'GET' }, (err, res, body) => {
        // Assert
        if (err) {
          assert.fail(err);
        } else {
          assert.equal(res.statusCode, 200, 'Status code not as expected');
          assert.equal(body, expectedBody, 'Body not as expected');
        }

        done();
      });
    });
  });

  it('Should listen on POST route', (done) => {
    // Arrange
    server = new ApiServer(env, {
      controllers: [TestController],
    });
    const endpoint = `http://localhost:${env.port}/Test/TestPost`;
    const expectedBody = 'POST works';

    // Act
    server.start().then(() => {
      request(endpoint, { method: 'POST' }, (err, res, body) => {
        // Assert
        if (err) {
          assert.fail(err);
        } else {
          assert.equal(res.statusCode, 200, 'Status code not as expected');
          assert.equal(body, expectedBody, 'Body not as expected');
        }

        done();
      });
    });
  });

  it('Should accept valid schema in POST', (done) => {
    // Arrange
    server = new ApiServer(env, {
      controllers: [TestController],
    });
    const endpoint = `http://localhost:${env.port}/Test/PostWithSchemaValidation`;
    const expectedBody = 'formatting good';

    const payload: IExampleObject = {
      id: 1,
      phone: '(800)123-4567',
      value: 'Test',
    };

    // Act
    server.start().then(() => {
      request(endpoint, {
        body: payload,
        headers: {
          "content-type": "application/json",
        },
        json: true,
        method: 'POST',
      }, (err, res, body) => {
        // Assert
        if (err) {
          assert.fail(err);
        } else {
          assert.equal(res.statusCode, 200, 'Status code not as expected');
          assert.equal(body, expectedBody, 'Body not as expected');
        }

        done();
      });
    });
  });

  it('Should reject invalid schema in POST', (done) => {
    // Arrange
    server = new ApiServer(env, {
      controllers: [TestController],
    });
    const endpoint = `http://localhost:${env.port}/Test/PostWithSchemaValidation`;

    const payload: IExampleObject = {
      id: 1,
    } as any;

    // Act
    server.start().then(() => {
      request(endpoint, {
        body: payload,
        headers: {
          "content-type": "application/json",
        },
        json: true,
        method: 'POST',
      }, (err, res, body) => {

        // Assert
        if (err) {
          assert.fail(err);
        } else {
          assert.equal(res.statusCode, 500, 'Status code not as expected');
          assert.equal(res.body.name, 'ApplicationError');
        }

        done();
      });
    });
  });

  it('Should accept and parse form data when specified', (done) => {
    // Arrange
    server = new ApiServer(env, {
      controllers: [TestController],
    });
    const endpoint = `http://localhost:${env.port}/Test/PostWithFormData`;

    const payload: IExampleObject = {
      id: 1,
      value: 'testtest',
    };

    // Act
    server.start().then(() => {
      request(endpoint, {
        formData: payload,
        headers: {
          "content-type": "multipart/form-data",
        },
        method: 'POST',
      }, (err, res, body) => {
        const bodyJSON = JSON.parse(body);

        // Assert
        if (err) {
          assert.fail(err);
        } else {
          assert.equal(res.statusCode, 200, 'Status code not as expected');
          assert.equal(bodyJSON.id, payload.id);
          assert.equal(bodyJSON.value, payload.value);
        }

        done();
      });
    });
  });

  it('Should not parse non-form data when specified', (done) => {
    // Arrange
    server = new ApiServer(env, {
      controllers: [TestController],
    });
    const endpoint = `http://localhost:${env.port}/Test/PostWithFormData`;

    const payload: IExampleObject = {
      id: 1,
      value: 'testtest',
    };

    // Act
    server.start().then(() => {
      request(endpoint, {
        headers: {
          "content-type": "application/json",
        },
        json: payload,
        method: 'POST',
      }, (err, res, body) => {

        // Assert
        if (err) {
          assert.fail(err);
        } else {
          assert.equal(res.statusCode, 400, 'Status code not as expected');
          assert.equal(res.body.name, 'BadRequestError', 'Error not returned as expected');
        }

        done();
      });
    });
  });

  it('Should not accept non-json when default (JSON) specified', (done) => {
    // Arrange
    server = new ApiServer(env, {
      controllers: [TestController],
    });
    const endpoint = `http://localhost:${env.port}/Test/PostJsonEcho`;

    const payload: IExampleObject = {
      id: 1,
      value: 'testtest',
    };

    // Act
    server.start().then(() => {
      request(endpoint, {
        formData: payload,
        headers: {
          "content-type": "multipart/form-data",
        },
        method: 'POST',
      }, (err, res, body) => {

        // Assert
        if (err) {
          assert.fail(err);
        } else {
          assert.equal(res.statusCode, 200, 'Status code not as expected');
          assert.equal(Object.keys(JSON.parse(body)).length, 0, 'Body should be an empty object');
        }

        done();
      });
    });
  });

  it('Should accept and parse url-encoded data when specified', (done) => {
    // Arrange
    server = new ApiServer(env, {
      controllers: [TestController],
    });
    const endpoint = `http://localhost:${env.port}/Test/PostWithUrlEncoded`;

    const payload: IExampleObject = {
      id: 1,
      value: 'testtest',
    };

    // Act
    server.start().then(() => {
      request(endpoint, {
        form: payload,
        headers: {
          "content-type": "application/x-www-form-urlencoded",
        },
        method: 'POST',
      }, (err, res, body) => {
        const bodyJSON = JSON.parse(body);

        // Assert
        if (err) {
          assert.fail(err);
        } else {
          assert.equal(res.statusCode, 200, 'Status code not as expected');
          assert.equal(bodyJSON.id, payload.id);
          assert.equal(bodyJSON.value, payload.value);
        }

        done();
      });
    });
  });

  it('Should not parse non-url-encoded data when specified', (done) => {
    // Arrange
    server = new ApiServer(env, {
      controllers: [TestController],
    });
    const endpoint = `http://localhost:${env.port}/Test/PostWithUrlEncoded`;

    const payload: IExampleObject = {
      id: 1,
      value: 'testtest',
    };

    // Act
    server.start().then(() => {
      request(endpoint, {
        headers: {
          "content-type": "application/json",
        },
        json: payload,
        method: 'POST',
      }, (err, res, body) => {

        // Assert
        if (err) {
          assert.fail(err);
        } else {
          assert.equal(res.statusCode, 400, 'Status code not as expected');
          assert.equal(res.body.name, 'BadRequestError', 'Error not thrown as expected');
        }

        done();
      });
    });
  });

});
