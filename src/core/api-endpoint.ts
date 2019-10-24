import { HttpContext } from "./http-context";
import { IHttpPostOptions } from "./decorations/http-types/http-post";
import { HttpRequestType } from "./decorations/http-types/http-request-type.enum";


export interface IHttpEndpointOptions {
  route?: string;
}

export class HttpEndpointOptions implements IHttpEndpointOptions {
  route?: string;

  constructor(init?: IHttpEndpointOptions) {
    if (init) {
      this.route = init.route || undefined;
    }
  }
}

export interface IApiEndpoint<T> {
  route: string;
  type: HttpRequestType;
  fn: (context: HttpContext) => any;
  options?: IHttpEndpointOptions | IHttpPostOptions<T>;
}

export class ApiEndpoint<T> implements IApiEndpoint<T> {
  route: string;
  type: HttpRequestType;
  fn: (context: HttpContext) => any;
  options?: IHttpEndpointOptions | IHttpPostOptions<T>;

  constructor(init?: IApiEndpoint<T>) {
    this.route = init ? init.route : '';
    this.type = init ? init.type : HttpRequestType.GET;
    this.fn = init ? init.fn : () => { return; };
    this.options = init && init.options ? init.options : undefined;

  }
}