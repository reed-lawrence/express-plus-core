import 'reflect-metadata';
import { ApiController } from '../controller';
import { IHttpTypeParameters } from './http-types/http-type-parameters';
import { HttpRequestType } from './http-types/http-request-type.enum';
import { HttpEndpointOptions } from '../api-endpoint';
import { MetadataKeys } from '../metadata-keys';
import { Utils } from '../utils';

export interface IControllerOptions {
  route?: string;
}

export class ControllerOptions implements IControllerOptions {
  route?: string;

  constructor(init?: IControllerOptions) {
    if (init) {
      this.route = init.route || undefined;
    }

    this.selfValidate();
  }

  private selfValidate() {
    if (this.route) {
      this.route = Utils.trimRoute(this.route);
    }
    return;
  }
}

export function Controller(options?: IControllerOptions) {
  console.log('@Controller invoked');
  // return function (target: ApiController, propertyKey: string, descriptor: PropertyDescriptor) {
  //   const params = new ControllerOptions(options);
  //   Reflect.defineMetadata(MetadataKeys.controller + propertyKey, params, target);
  // }
  return function (constructor: { new(): ApiController }) {
    console.log('@Controller return fn invoked');
    const params = new ControllerOptions(options);
    console.dir(constructor);
    Reflect.defineMetadata(MetadataKeys.controller + constructor.name, params, constructor.prototype);
    console.dir(Reflect.getMetadataKeys(constructor.prototype));
  }
}