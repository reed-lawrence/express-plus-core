import 'reflect-metadata';
import { IApiController } from '../api-controller';
import { ApiEndpoint } from '../api-endpoint';
import { MetadataKeys } from '../metadata-keys';
import { Utils } from '../utils';
import { IHttpTypeParameters } from './http-types.decorator';

/**
 * Method that gathers metadata assigned to the ApiController class and assigns the endpoints accordingly
 * @param obj metadata target
 */
function registerEndpoints(obj: any) {
  const output: ApiEndpoint[] = [];

  // Get the metadata keys of this controller
  const metadataKeys: string[] = Reflect.getMetadataKeys(obj);

  // For each metadata key
  for (const key of metadataKeys) {

    // Get the name of the metadata key
    const keyVal: IHttpTypeParameters = Reflect.getMetadata(key, obj);

    // If the key is an endpoint
    if (key.indexOf('endpoint:') !== -1 && keyVal.type) {

      // Get the function name by splitting the key name. Ex: <const>:<name>:<http method enum> -> endpoint:TestRoute:1
      const fnName = key.split(':')[1];

      // Ensure the derieved function name is a key of this controller (sanity test)
      if (!obj[fnName]) {
        console.log(Object.keys(obj));
        throw new Error(`function name <${fnName}> derived from endpoint metadata not a key of the specified controller`);
      }

      // Push the endpoint to the list of valid API endpoints for this controller
      output.push(new ApiEndpoint({
        fnName,
        options: keyVal.options ? keyVal.options : undefined,
        route: keyVal.options && keyVal.options.route ? keyVal.options.route : fnName === 'default' ? '' : fnName,
        type: keyVal.type,
      }));
    }
  }

  return output;
}

/**
 * Gets the route prefix for this controller
 */
function getRoute(obj: any, opts?: IControllerOptions): string | undefined {
  // If the route is manually specified in the @Controller decorator
  if (opts && opts.route) {

    // If the preserveCase is specified as true in the @Controller decorator options
    return opts.preseveCase ? opts.route : opts.route.toLowerCase();

  } else {

    // Else, implicitly determine Controller prefix from the class name

    const className: string = obj.constructor.name;
    const index = className.indexOf('Controller');

    if (className && index >= 0) {
      const arr = className.split('Controller');
      return opts && opts.preseveCase ? arr[0] : arr[0].toLowerCase();
    } else {
      console.error(`Cannot implicitly determine a controller route from class <${className}>. Please specify a route within the @Controller decorator, or ensure "Controller" appears in the class instance name.`);
      return undefined;
    }
  }
}

export interface IControllerOptions {
  route?: string;
  preseveCase?: boolean;
}

export class ControllerOptions implements IControllerOptions {
  public route?: string;
  public preseveCase?: boolean = false;

  constructor(init?: IControllerOptions) {
    if (init) {
      this.preseveCase = init.preseveCase || false;
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
  return (constructor: new (args?: any) => object) => {
    const params = new ControllerOptions(options);
    const endpoints: ApiEndpoint[] = registerEndpoints(constructor.prototype);

    (constructor.prototype as IApiController)._endpoints = endpoints;
    (constructor.prototype as IApiController)._route = getRoute(constructor.prototype, options);

    Reflect.defineMetadata(MetadataKeys.controller + constructor.name, params, constructor.prototype);
  };
}
