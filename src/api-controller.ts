import { ApiEndpoint, IApiEndpoint } from './api-endpoint';
import { ControllerOptions } from './decorators/controller.decorator';
import { HttpRequestType, IHttpTypeParameters } from './decorators/http-types.decorator';
import { HttpContext } from './http-context';
import { MetadataKeys } from './metadata-keys';
import { NoContent } from './return-types';

interface IStringOnlyKeys {
  [key: string]: any;
}

export class ApiController {
  [key: string]: any;
  public readonly endpoints: ApiEndpoint[] = [];
  public controller_id: number = 0;

  constructor() {
  }

  public async registerEndpoints() {
    const metadataKeys: string[] = Reflect.getMetadataKeys(this);

    for (const key of metadataKeys) {
      const keyVal: IHttpTypeParameters = Reflect.getMetadata(key, this);
      if (key.indexOf('endpoint:') !== -1 && keyVal.type) {
        const fnName = key.split(':')[1];
        if (!this[fnName as keyof this]) {
          console.log(Object.keys(this));
          throw new Error(`function name <${fnName}> derived from endpoint metadata not a key of the specified controller`);
        }

        this.endpoints.push(new ApiEndpoint({
          fnName: fnName,
          options: keyVal.options ? keyVal.options : undefined,
          route: keyVal.options && keyVal.options.route ? keyVal.options.route : fnName === 'default' ? '' : fnName,
          type: keyVal.type,
        }));
      }
    }
  }


  public async default({ req, res }: HttpContext): Promise<any> {
    return NoContent(res);
  }

  public getRoute(): string {
    const constructorName: string = Object.getPrototypeOf(this).constructor.name;

    const metadata: ControllerOptions = Reflect.getMetadata(MetadataKeys.controller + constructorName, this);
    if (metadata && metadata.route) {
      return metadata.preseveCase ? metadata.route : metadata.route.toLowerCase();
    } else {

      const index = constructorName.indexOf('Controller');

      if (constructorName && index) {
        const arr = constructorName.split('Controller');
        return metadata.preseveCase ? arr[0] : arr[0].toLowerCase();
      } else {
        throw new Error('Cannot implicitly determine a controller route. Please specify a route within the @Controller decorator, or ensure "Controller" appears in the class instance name.');
      }
    }
  }
}
