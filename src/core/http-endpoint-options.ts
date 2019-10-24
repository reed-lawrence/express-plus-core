import { Utils } from "./utils";

export interface IHttpEndpointOptions {
  route?: string;
}

export class HttpEndpointOptions implements IHttpEndpointOptions {
  public route?: string;

  constructor(init?: IHttpEndpointOptions) {
    if (init) {
      this.route = init.route ? Utils.trimRoute(init.route) : undefined;
    }
  }
}
