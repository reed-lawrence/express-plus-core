import assert, { fail } from 'assert';
import { afterEach, describe, it } from 'mocha';
import 'reflect-metadata';
import request from 'request';
import { ApiServer, ServerErrorMessages } from '../src/api-server';
import { ControllerOptions } from '../src/decorators/controller.decorator';
import { HttpRequestType } from '../src/decorators/http-types.decorator';
import { MetadataKeys } from '../src/metadata-keys';
import { IExampleObject } from './classes/example-object';
import { InvalidAuthRoute, InvalidController } from './controllers/bad-controllers';
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

  it('Should create default endpoint', () => {
    // Arrange
    const controller = new TestController();

    // Act
    const defEndpoint = controller.endpoints.find((e) => e.route === '');

    // Assert
    if (defEndpoint) {
      assert.equal(defEndpoint.route, '', 'Route not as expected');
      assert.equal(defEndpoint.type, HttpRequestType.GET, 'Endpoint type not as expected');
      assert.equal(defEndpoint.fn, controller.default, 'Function not bound correctly to default endpoint');
    } else {
      assert.fail('No default endpoint found');
    }
  });

  it('Should register all endpoints', () => {
    // Arrange
    const controller = new TestController();
    const postRoute = 'TestPost';
    const getRoute = 'TestGet';

    // Act
    const postEndpoint = controller.endpoints.find((e) => e.route === postRoute);
    const getEndpoint = controller.endpoints.find((e) => e.route === getRoute);

    // Assert
    if (postEndpoint) {
      assert.equal(postEndpoint.type, HttpRequestType.POST, 'Post endpoint not of POST request enum');
      assert.equal(postEndpoint.fn, controller.TestPost, 'Function not bound correctly to POST endpoint');
    } else {
      assert.fail('Post endpoint not created');
    }

    if (getEndpoint) {
      assert.equal(getEndpoint.type, HttpRequestType.GET, 'Post endpoint not of POST request enum');
      assert.equal(getEndpoint.fn, controller.TestGet, 'Function not bound correctly to POST endpoint');
    } else {
      assert.fail('Get endpoint not created');
    }

  });

  it('Should not register non-decorated class methods', () => {
    // Arrange
    const controller = new TestController();

    // Assert
    assert.equal(controller.endpoints.findIndex((e) => e.fn === controller.shouldNotRegister) === -1, true);
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
  it('Constructor should register basic params', () => {
    // Arrange + Act
    const server = new ApiServer({ debug: true, port: '8000' });

    // Assert

    assert.equal(server.port, '8000', 'Port not as expected');

    assert.equal(server.debug, true, 'Debug not set correctly');
  });

  it('Should register endpoints from injected Controllers', async () => {
    // Arrange
    const server = new ApiServer({ debug: true, port: '8000' }, {
      controllers: [TestController],
    });
    const expectedPrefix = 'Test';
    const controller = new TestController();

    // Act

    // @ts-ignore
    await server.registerControllers(server.controllers);
    const getEndpoint = server.routes.find((r) => r.route === `/${expectedPrefix}/TestGet`);

    // Assert
    if (getEndpoint) {
      assert.equal(getEndpoint.type === 'GET', true, 'TestGet route not to GET type');
      assert.equal(getEndpoint.endpoint.fn, controller.TestGet, 'Registered route does not have same function instance');
    } else {
      assert.equal(server.routes, [], 'Routes not as expected');
    }
  });

  it('Should not register a controller without a decorator', async () => {
    // Arrange
    const server = new ApiServer({ debug: true, port: '8000' }, {
      controllers: [InvalidController],
    });

    // Act
    try {
      // @ts-ignore
      await server.registerControllers(server.controllers);
    } catch (err) {

      // Assert
      assert.equal(err.message, ServerErrorMessages.invalidController);
      return;
    }
    fail('Expexted error to be thrown, left catch block');
  });

  it('Should not register an endpoint if auth required, but none supplied', async () => {
    // Arrange
    const server = new ApiServer({ debug: true, port: '8000' }, {
      controllers: [InvalidAuthRoute],
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
    const server = new ApiServer({ debug: true, port: '8000' }, {
      controllers: [TestController],
    });

    // Act
    // @ts-ignore
    await server.registerControllers(server.controllers);
    const route = server.routes.find((r) => r.route === '/Test/OverrideRoute');

    // Assert
    assert.equal(route !== undefined, true, 'Route not registered');
  });

});

describe('Server', () => {
  let server: ApiServer;
  afterEach(() => server.stop());

  it('Should listen on port', (done) => {
    // Arrange
    const port = '8000';
    server = new ApiServer({ debug: true, port }, {
      controllers: [],
    });
    const endpoint = `http://localhost:${port}/`;

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
    const port = '8000';
    server = new ApiServer({ debug: true, port }, {
      controllers: [TestController],
    });
    const endpoint = `http://localhost:${port}/Test/TestGet`;
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
    const port = '8000';
    server = new ApiServer({ debug: true, port }, {
      controllers: [TestController],
    });
    const endpoint = `http://localhost:${port}/Test/TestPost`;
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
    const port = '8000';
    server = new ApiServer({ debug: true, port }, {
      controllers: [TestController],
    });
    const endpoint = `http://localhost:${port}/Test/PostWithSchemaValidation`;
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
    const port = '8000';
    server = new ApiServer({ debug: true, port }, {
      controllers: [TestController],
    });
    const endpoint = `http://localhost:${port}/Test/PostWithSchemaValidation`;

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
    const port = '8000';
    server = new ApiServer({ debug: true, port }, {
      controllers: [TestController],
    });
    const endpoint = `http://localhost:${port}/Test/PostWithFormData`;

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
    const port = '8000';
    server = new ApiServer({ debug: true, port }, {
      controllers: [TestController],
    });
    const endpoint = `http://localhost:${port}/Test/PostWithFormData`;

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
    const port = '8000';
    server = new ApiServer({ debug: true, port }, {
      controllers: [TestController],
    });
    const endpoint = `http://localhost:${port}/Test/PostJsonEcho`;

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
    const port = '8000';
    server = new ApiServer({ debug: true, port }, {
      controllers: [TestController],
    });
    const endpoint = `http://localhost:${port}/Test/PostWithUrlEncoded`;

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
    const port = '8000';
    server = new ApiServer({ debug: true, port }, {
      controllers: [TestController],
    });
    const endpoint = `http://localhost:${port}/Test/PostWithUrlEncoded`;

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
