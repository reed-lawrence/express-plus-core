import { Request, Response, Dictionary } from "express-serve-static-core";
import "reflect-metadata";
import { IHttpTypeParameters } from "./decorations/http-type";
import { Utils } from "./utils";
import { HttpContext } from "./http-context";
import { Ok } from "./return-types";

export interface IApiController<T> {
  routePrefix: string;
  endpoints: IApiEndpoint<T>[];
  default: (context: HttpContext) => Response;
}

export class ApiController<T> implements IApiController<T> {
  routePrefix: string;
  endpoints: ApiEndpoint<T>[];
  default(context: HttpContext) {
    return Ok(context);
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
          route: keyVal.options && keyVal.options.route ? keyVal.options.route : fnName,
          fn: this[fnName as Extract<keyof this, string>] as any,
          type: keyVal.type,
          bodyType: keyVal.options ? keyVal.options.fromBody : undefined
        }));
      }
    }

    if (this['default']) {
      this.endpoints.push(new ApiEndpoint<T>({
        route: '',
        fn: this['default'],
        type: 'GET',
        bodyType: undefined
      }));
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

export interface IApiEndpoint<T> {
  route: string;
  type: 'GET' | 'POST' | 'PUT' | 'DELETE';
  fn: (context: HttpContext) => any;
  bodyType?: { new(): T } | T | undefined;
}

export class ApiEndpoint<T> implements IApiEndpoint<T> {
  route: string;
  type: 'GET' | 'POST' | 'PUT' | 'DELETE';
  fn: (context: HttpContext) => any;
  bodyType?: { new(): T } | T | undefined;

  constructor(init?: IApiEndpoint<T>) {
    this.route = init ? init.route : '';
    this.type = init ? init.type : 'GET';
    this.fn = init ? init.fn : () => { return; };
    this.bodyType = init && init.bodyType ? init.bodyType : undefined;
  }
}