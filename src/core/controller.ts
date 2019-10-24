import "reflect-metadata";
import { HttpContext } from "./http-context";
import { Ok } from "./return-types";
import { ApiEndpoint, IApiEndpoint } from "./api-endpoint";
import { IHttpTypeParameters } from './decorations/http-types/http-type-parameters';
import { HttpRequestType } from "./decorations/http-types/http-request-type.enum";

export interface IApiController<T> {
  routePrefix: string;
  endpoints: IApiEndpoint<T>[];
  default: (context: HttpContext) => any;
}

export class ApiController<T> implements IApiController<T> {
  routePrefix: string;
  endpoints: ApiEndpoint<T>[];
  async default(context: HttpContext) {
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
      if (key.indexOf('endpoint:') !== -1 && keyVal.type) {
        const fnName = key.split('endpoint:')[1];
        this.endpoints.push(new ApiEndpoint({
          route: keyVal.options && keyVal.options.route ? keyVal.options.route : fnName,
          fn: this[fnName as Extract<keyof this, string>] as any,
          type: keyVal.type,
          options: keyVal.options ? keyVal.options : undefined
        }));
      }
    }

    if (this['default']) {
      this.endpoints.push(new ApiEndpoint<T>({
        route: '',
        fn: this['default'],
        type: HttpRequestType.GET
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
