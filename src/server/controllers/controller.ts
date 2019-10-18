import { Request, Response } from "express-serve-static-core";
import "reflect-metadata";

export interface IApiController {
  routePrefix: string;
  endpoints: IApiEndpoint[];
}

export class ApiController implements IApiController {
  routePrefix: string;
  endpoints: ApiEndpoint[];
  default(req: Request<string[]>, res: Response) {

  }

  constructor(routePrefix?: string) {
    // console.log('ControllerConstructor called');
    this.endpoints = [];
    this.routePrefix = routePrefix || this.getSelfRoute();

    const metadataKeys: string[] = Reflect.getMetadataKeys(this);
    // console.log(metadataKeys);
    for (const key of metadataKeys) {
      const keyVal = Reflect.getMetadata(key, this);
      if (key.indexOf('endpoint:') !== -1 && (keyVal === 'GET' || keyVal === 'POST' || keyVal === 'PUT' || keyVal === 'DELETE')) {
        const fnName = key.split('endpoint:')[1];
        this.endpoints.push(new ApiEndpoint({
          route: fnName,
          fn: this[fnName as Extract<keyof this, string>] as any,
          type: keyVal
        }));
      }
    }

    console.log(this);
  }

  private getSelfRoute(): string {
    const constructorName: string = Object.getPrototypeOf(this).constructor.name;
    const index = constructorName.indexOf('Controller');

    if (constructorName && index) {
      const arr = constructorName.split('Controller');
      // console.log(arr);
      return arr[0];
    } else {
      throw new Error('Invalid Controller Name');
    }
  }
}

export interface IApiEndpoint {
  route: string;
  type: 'GET' | 'POST' | 'PUT' | 'DELETE';
  fn: (req: Request<string[]>, res: Response) => any;
}

export class ApiEndpoint implements IApiEndpoint {
  route: string;
  type: 'GET' | 'POST' | 'PUT' | 'DELETE';
  fn: (req: Request<string[]>, res: Response) => any;

  constructor(init?: IApiEndpoint) {
    this.route = init ? init.route : '';
    this.type = init ? init.type : 'GET';
    this.fn = init ? init.fn : () => { return; };
  }
}

export function HttpType(args: 'GET' | 'POST' | 'PUT' | 'DELETE') {
  // console.log(args);
  return function (target: ApiController, propertyKey: string, descriptor: PropertyDescriptor) {
    // target.endpoints.push(new Endpoint());
    Reflect.defineMetadata('endpoint:' + propertyKey, args, target);
    // console.log(target, propertyKey, descriptor);
  }
}