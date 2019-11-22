import { HttpEndpointOptions, IHttpEndpointOptions } from "./http-endpoint-options";
import { HttpContentType } from "./http-types.decorator";

export interface IHttpPutOptions extends IHttpEndpointOptions {
  fromBody?: (new () => any) | object;
  contentType?: HttpContentType;
}

export class HttpPutOptions extends HttpEndpointOptions implements IHttpPutOptions {
  public fromBody?: (new () => any) | object;
  public contentType?: HttpContentType = HttpContentType.JSON;

  constructor(init?: IHttpPutOptions) {
    super(init);
    if (init) {
      if (init.contentType) { this.contentType = init.contentType; }
      if (init.fromBody) { this.fromBody = init.fromBody; }
    }
  }
}
