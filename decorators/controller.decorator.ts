import 'reflect-metadata';

import { ApiController } from '../index'
import { MetadataKeys } from '../lib/metadata-keys';
import { Utils } from '../lib/utils';

export interface IControllerOptions {
  route?: string;
}

export class ControllerOptions implements IControllerOptions {
  public route?: string;

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
  return (constructor: new () => ApiController) => {
    console.log('@Controller return fn invoked');
    const params = new ControllerOptions(options);
    console.dir(constructor);
    Reflect.defineMetadata(MetadataKeys.controller + constructor.name, params, constructor.prototype);
    console.dir(Reflect.getMetadataKeys(constructor.prototype));
  };
}
