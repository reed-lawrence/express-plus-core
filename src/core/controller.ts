import "reflect-metadata";
import { HttpContext } from "./http-context";
import { Ok } from "./return-types";
import { ApiEndpoint, IApiEndpoint } from "./api-endpoint";
import { IHttpTypeParameters } from './decorations/http-types/http-type-parameters';
import { HttpRequestType } from "./decorations/http-types/http-request-type.enum";
import { MetadataKeys } from "./metadata-keys";
import { ControllerOptions } from './decorations/controller.decorator';


export interface IApiController {
  readonly endpoints: IApiEndpoint[];
  default: (context: HttpContext) => any;
}

export class ApiController implements IApiController {
  readonly endpoints: ApiEndpoint[];
  async default(context: HttpContext) {
    return Ok(context);
  }

  constructor() {
    // console.log('ControllerConstructor called');
    this.endpoints = [];

    const metadataKeys: string[] = Reflect.getMetadataKeys(this);
    // console.log(metadataKeys);
    for (const key of metadataKeys) {
      const keyVal: IHttpTypeParameters = Reflect.getMetadata(key, this);
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
      this.endpoints.push(new ApiEndpoint({
        route: '',
        fn: this['default'],
        type: HttpRequestType.GET
      }));
    }

    console.log(this);
  }

  public getRoute(): string {
    const keys = Reflect.getMetadataKeys(this);
    const constructorName: string = Object.getPrototypeOf(this).constructor.name;

    const metadata: ControllerOptions = Reflect.getMetadata(MetadataKeys.controller + constructorName, this);
    if (metadata && metadata.route) {
      return metadata.route;
    } else {

      const index = constructorName.indexOf('Controller');

      if (constructorName && index) {
        const arr = constructorName.split('Controller');
        // console.log(arr);
        return arr[0];
      } else {
        throw new Error('Cannot implicitly determine a controller name. Please specify a route within the @Controller decorator, or ensure "Controller" appears in the class instance name.');
      }
    }
  }
}
