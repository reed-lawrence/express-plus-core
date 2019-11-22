import 'reflect-metadata';
import { ApiController } from '../api-controller';
import { MetadataKeys } from '../metadata-keys';
import { Utils } from '../utils';

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
  return (constructor: new () => ApiController) => {
    const params = new ControllerOptions(options);
    Reflect.defineMetadata(MetadataKeys.controller + constructor.name, params, constructor.prototype);
  };
}
