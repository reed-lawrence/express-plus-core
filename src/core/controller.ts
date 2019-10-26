import "reflect-metadata";
import { ApiEndpoint, IApiEndpoint } from "./api-endpoint";
import { ControllerOptions } from './decorations/controller.decorator';
import { HttpRequestType } from "./decorations/http-types/http-request-type.enum";
import { IHttpTypeParameters } from './decorations/http-types/http-type-parameters';
import { HttpContext } from "./http-context";
import { MetadataKeys } from "./metadata-keys";
import { Ok } from "./return-types";

export interface IApiController {
  readonly endpoints: IApiEndpoint[];
  default: (context: HttpContext) => Promise<any>;
}

export class ApiController implements IApiController {
  public readonly endpoints: ApiEndpoint[];

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
          fn: this[fnName as Extract<keyof this, string>] as any,
          options: keyVal.options ? keyVal.options : undefined,
          route: keyVal.options && keyVal.options.route ? keyVal.options.route : fnName,
          type: keyVal.type,
        }));
      }
    }

    if (this.default) {
      this.endpoints.push(new ApiEndpoint({
        fn: this.default,
        route: '',
        type: HttpRequestType.GET,
      }));
    }

    console.log(this);
  }
  public async default({ req, res }: HttpContext) {
    return Ok(res);
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
