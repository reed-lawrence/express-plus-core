import { ApiEndpoint, IApiEndpoint } from './api-endpoint';
import { ControllerOptions } from './decorators/controller.decorator';
import { HttpRequestType, IHttpTypeParameters } from './decorators/http-types.decorator';
import { HttpContext } from './http-context';
import { MetadataKeys } from './metadata-keys';
import { NoContent } from './return-types';

export class ApiController {
  public readonly endpoints: ApiEndpoint[];

  constructor() {
    this.endpoints = [];

    const metadataKeys: string[] = Reflect.getMetadataKeys(this);

    for (const key of metadataKeys) {
      const keyVal: IHttpTypeParameters = Reflect.getMetadata(key, this);
      if (key.indexOf('endpoint:') !== -1 && keyVal.type) {
        const fnName = key.split(':')[1];
        this.endpoints.push(new ApiEndpoint({
          fn: this[fnName as Extract<keyof this, string>] as any,
          options: keyVal.options ? keyVal.options : undefined,
          route: keyVal.options && keyVal.options.route ? keyVal.options.route : fnName === 'default' ? '' : fnName,
          type: keyVal.type,
        }));
      }
    }

    // if (this.default && defaultOverridden === false) {
    //   this.endpoints.push(new ApiEndpoint({
    //     fn: this.default,
    //     route: '',
    //     type: HttpRequestType.GET,
    //   }));
    // }

  }


  public async default({ req, res }: HttpContext): Promise<any> { };

  public getRoute(): string {
    const constructorName: string = Object.getPrototypeOf(this).constructor.name;

    const metadata: ControllerOptions = Reflect.getMetadata(MetadataKeys.controller + constructorName, this);
    if (metadata && metadata.route) {
      return metadata.route;
    } else {

      const index = constructorName.indexOf('Controller');

      if (constructorName && index) {
        const arr = constructorName.split('Controller');
        return arr[0];
      } else {
        throw new Error('Cannot implicitly determine a controller route. Please specify a route within the @Controller decorator, or ensure "Controller" appears in the class instance name.');
      }
    }
  }
}
