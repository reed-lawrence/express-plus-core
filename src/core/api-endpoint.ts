import { HttpContext } from "./http-context";
import { IHttpPostOptions } from "./decorations/http-types/http-post";
import { HttpRequestType } from "./decorations/http-types/http-request-type.enum";
import { Utils } from "./utils";


export interface IHttpEndpointOptions {
  route?: string;
}

export class HttpEndpointOptions implements IHttpEndpointOptions {
  route?: string;

  constructor(init?: IHttpEndpointOptions) {
    if (init) {
      this.route = init.route ? Utils.trimRoute(init.route) : undefined;
    }
  }
}

export interface IApiEndpoint {
  route: string;
  type: HttpRequestType;
  fn: (context: HttpContext) => any;
  options?: IHttpEndpointOptions | IHttpPostOptions;
}

export class ApiEndpoint implements IApiEndpoint {
  route: string;
  type: HttpRequestType;
  fn: (context: HttpContext) => any;
  options?: IHttpEndpointOptions | IHttpPostOptions;

  constructor(init?: IApiEndpoint) {
    this.route = init ? init.route : '';
    this.type = init ? init.type : HttpRequestType.GET;
    this.fn = init ? init.fn : () => { return; };
    this.options = init && init.options ? init.options : undefined;

  }
}