import 'reflect-metadata';

import { ApiController } from '../../controller';
import { MetadataKeys } from '../../metadata-keys';
import { HttpContentType } from './http-content-type.enum';
import { HttpEndpointOptions, IHttpEndpointOptions } from './http-endpoint-options';
import { HttpRequestType } from './http-request-type.enum';
import { IHttpTypeParameters } from './http-type-parameters';

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

export function HttpPost(options?: IHttpPostOptions) {
  return (target: ApiController, propertyKey: string, descriptor: PropertyDescriptor) => {
    const params: IHttpTypeParameters = { type: HttpRequestType.POST, options: new HttpPostOptions(options) };
    Reflect.defineMetadata(MetadataKeys.endpoint + propertyKey, params, target);
  };
}
