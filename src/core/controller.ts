import { Request, Response } from "express-serve-static-core";
import "reflect-metadata";
import { IHttpTypeParameters } from "./decorations/http-type";

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
      const keyVal: IHttpTypeParameters<any> = Reflect.getMetadata(key, this);
      if (key.indexOf('endpoint:') !== -1 && (keyVal.type === 'GET' || keyVal.type === 'POST' || keyVal.type === 'PUT' || keyVal.type === 'DELETE')) {
        const fnName = key.split('endpoint:')[1];
        this.endpoints.push(new ApiEndpoint({
          route: fnName,
          fn: this[fnName as Extract<keyof this, string>] as any,
          type: keyVal.type,
          bodyType: keyVal.fromBody
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
  bodyType?: { new(): ObjectConstructor } | undefined;
}

export class ApiEndpoint implements IApiEndpoint {
  route: string;
  type: 'GET' | 'POST' | 'PUT' | 'DELETE';
  fn: (req: Request<string[]>, res: Response) => any;
  bodyType?: { new(): ObjectConstructor } | undefined;

  constructor(init?: IApiEndpoint) {
    this.route = init ? init.route : '';
    this.type = init ? init.type : 'GET';
    this.fn = init ? init.fn : () => { return; };
    this.bodyType = init && init.bodyType ? init.bodyType : undefined;
  }
}