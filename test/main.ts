import 'reflect-metadata';
import { describe, it } from "mocha";
import { TestController } from './controllers/test.controller';
import { MetadataKeys } from '../src/metadata-keys';
import assert, { fail, ok } from 'assert';
import { HttpRequestType } from '../src/decorators/http-types.decorator';
import { CustomRouteController } from './controllers/custom-route.controller';
import { ControllerOptions } from '../src/decorators/controller.decorator';
import { Server, ServerErrorMessages } from '../src/server';
import { InvalidController, InvalidAuthRoute } from './controllers/bad-controllers';

describe('Controller', () => {
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
    const defEndpoint = controller.endpoints.find(e => e.route === '');

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
    const postEndpoint = controller.endpoints.find(e => e.route === postRoute);
    const getEndpoint = controller.endpoints.find(e => e.route === getRoute);

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
    assert.equal(controller.endpoints.findIndex(e => e.fn === controller.shouldNotRegister) === -1, true);
  });

  it('Should assign custom route metadata', () => {
    // Arrange
    const controller = new CustomRouteController();

    // Act
    const keys = Reflect.getMetadataKeys(controller);
    const options: ControllerOptions | undefined = Reflect.getMetadata(
      keys.find(k => k.indexOf(MetadataKeys.controller + 'CustomRouteController') !== -1),
      controller);

    // Assert
    if (options) {
      assert.equal(options.route, 'TestRoute');
    } else {
      assert.fail(`Options not supplied for controller. Keys: ${keys.toString()}`);
    }
  });
});

describe('Server', () => {
  it('Constructor should register basic params', () => {
    // Arrange + Act
    const server = new Server({ debug: true, port: '8000' });

    // Assert
    assert.equal(server.port, '8000', 'Port not as expected');
    assert.equal(server.debug, true, 'Debug not set correctly');
  });

  it('Should register endpoints from injected Controllers', async () => {
    // Arrange
    const server = new Server({ debug: true, port: '8000' }, {
      controllers: [TestController]
    });
    const expectedPrefix = 'Test';
    const controller = new TestController();

    // Act
    await server.registerControllers(server.controllers);
    const getEndpoint = server.routes.find(r => r.route === `/${expectedPrefix}/TestGet`);

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
    const server = new Server({ debug: true, port: '8000' }, {
      controllers: [InvalidController]
    });

    // Act
    try {
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
    const server = new Server({ debug: true, port: '8000' }, {
      controllers: [InvalidAuthRoute]
    });

    // Act
    try {
      await server.registerControllers(server.controllers);
    } catch (err) {

      // Assert
      assert.equal(err.message, ServerErrorMessages.invalidRoute);
      return;
    }
    fail('Expexted error to be thrown, left catch block');
  });
});