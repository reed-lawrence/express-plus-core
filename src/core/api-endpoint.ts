import { IHttpPostOptions } from "./decorations/http-types/http-post";
import { HttpRequestType } from "./decorations/http-types/http-request-type.enum";
import { HttpContext } from "./http-context";
import { IHttpEndpointOptions } from "./http-endpoint-options";

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
