import { IHttpEndpointOptions } from './decorators/http-endpoint-options';
import { IHttpPostOptions } from './decorators/http-post-options';
import { HttpRequestType } from './decorators/http-types.decorator';
import { HttpContext } from './http-context';
import { ApiController } from './api-controller';

export interface IApiEndpoint<C extends ApiController = any> {
  route: string;
  type: HttpRequestType;
  // fn: (context: HttpContext) => Promise<any>;
  fnName?: string;
  options?: IHttpEndpointOptions | IHttpPostOptions;
}

export class ApiEndpoint<C extends ApiController = any> implements IApiEndpoint<C> {
  public route: string;
  public type: HttpRequestType;
  // public fn: (context: HttpContext) => Promise<any>;
  fnName?: string;
  public options?: IHttpEndpointOptions | IHttpPostOptions;

  constructor(init?: IApiEndpoint<C>) {
    this.route = init ? init.route : '';
    this.type = init ? init.type : HttpRequestType.GET;
    // this.fn = init ? init.fn : Promise.resolve;
    this.fnName = init ? init.fnName : undefined;
    this.options = init && init.options ? init.options : undefined;
  }
}
