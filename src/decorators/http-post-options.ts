import { HttpEndpointOptions, IHttpEndpointOptions } from "./http-endpoint-options";
import { HttpContentType } from "./http-types.decorator";

export interface IHttpPostOptions extends IHttpEndpointOptions {
  fromBody?: (new () => any) | object;
  contentType?: HttpContentType;
}

export class HttpPostOptions extends HttpEndpointOptions implements IHttpPostOptions {
  public fromBody?: (new () => any) | object;
  public contentType?: HttpContentType;

  constructor(init?: IHttpPostOptions) {
    super(init);
    if (init) {
      this.contentType = init.contentType;
      this.fromBody = init.fromBody || undefined;
    }
  }
}
