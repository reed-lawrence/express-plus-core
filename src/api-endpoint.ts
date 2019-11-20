import {
    HttpRequestType, IHttpEndpointOptions, IHttpPostOptions
} from './decorators/http-types.decorator';
import { HttpContext } from './http-context';

export interface IApiEndpoint {
  route: string;
  type: HttpRequestType;
  fn: (context: HttpContext) => Promise<any>;
  options?: IHttpEndpointOptions | IHttpPostOptions;
}

export class ApiEndpoint implements IApiEndpoint {
  public route: string;
  public type: HttpRequestType;
  public fn: (context: HttpContext) => Promise<any>;
  public options?: IHttpEndpointOptions | IHttpPostOptions;

  constructor(init?: IApiEndpoint) {
    this.route = init ? init.route : '';
    this.type = init ? init.type : HttpRequestType.GET;
    this.fn = init ? init.fn : Promise.resolve;
    this.options = init && init.options ? init.options : undefined;
  }
}