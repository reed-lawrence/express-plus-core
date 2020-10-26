import { ApiEndpoint } from './api-endpoint';
import { ServerErrorMessages } from './api-server';
import { ControllerOptions } from './decorators/controller.decorator';
import { IHttpTypeParameters } from './decorators/http-types.decorator';
import { HttpContext } from './http-context';
import { MetadataKeys } from './metadata-keys';

interface IStringOnlyKeys {
  [key: string]: any;
}

export class ApiController {
  [key: string]: any;
  public readonly endpoints: ApiEndpoint[] = [];
  public controller_id: number = 0;

  constructor() {
    // Validate that the class has the @Controller decorator
    this.getMetadata();
  }

  private getMetadata() {
    // Get the name of this class instance
    const constructorName: string = Object.getPrototypeOf(this).constructor.name;

    // Get the metadata assigned to this controller by controller:<this class name>
    const metadata: ControllerOptions | undefined = Reflect.getMetadata(MetadataKeys.controller + constructorName, this);

    if (!metadata) {
      throw new Error(ServerErrorMessages.invalidController);
    }

    return metadata;
  }

  /**
   * Method that gathers metadata assigned to the ApiController class and assigns the endpoints accordingly
   */
  public async registerEndpoints() {

    // Get the metadata keys of this controller
    const metadataKeys: string[] = Reflect.getMetadataKeys(this);

    // For each metadata key
    for (const key of metadataKeys) {

      // Get the name of the metadata key
      const keyVal: IHttpTypeParameters = Reflect.getMetadata(key, this);

      // If the key is an endpoint
      if (key.indexOf('endpoint:') !== -1 && keyVal.type) {

        // Get the function name by splitting the key name. Ex: <const>:<name>:<http method enum> -> endpoint:TestRoute:1
        const fnName = key.split(':')[1];

        // Ensure the derieved function name is a key of this controller (sanity test)
        if (!this[fnName as keyof this]) {
          console.log(Object.keys(this));
          throw new Error(`function name <${fnName}> derived from endpoint metadata not a key of the specified controller`);
        }

        // Push the endpoint to the list of valid API endpoints for this controller
        this.endpoints.push(new ApiEndpoint({
          fnName,
          options: keyVal.options ? keyVal.options : undefined,
          route: keyVal.options && keyVal.options.route ? keyVal.options.route : fnName === 'default' ? '' : fnName,
          type: keyVal.type,
        }));
      }
    }
  }

  // Will not register because it does not have a HttpType decorator
  public async default({ req, res }: HttpContext): Promise<any> {
    return;
  }

  /**
   * Gets the route prefix for this controller
   */
  public getRoute(): string {

    // Get the metadata assigned to this controller by controller:<this class name>
    const metadata = this.getMetadata();

    // If the route is manually specified in the @Controller decorator
    if (metadata.route) {

      // If the preserveCase is specified as true in the @Controller decorator options
      return metadata.preseveCase ? metadata.route : metadata.route.toLowerCase();

    } else {

      // Else, implicitly determine Controller prefix from the class name

      const className: string = Object.getPrototypeOf(this).constructor.name;
      const index = className.indexOf('Controller');

      if (className && index >= 0) {
        const arr = className.split('Controller');
        return metadata.preseveCase ? arr[0] : arr[0].toLowerCase();
      } else {
        throw new Error('Cannot implicitly determine a controller route. Please specify a route within the @Controller decorator, or ensure "Controller" appears in the class instance name.');
      }
    }
  }
}
