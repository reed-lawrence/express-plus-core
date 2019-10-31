import 'reflect-metadata';

import { ApiController } from '../../controller';
import { MetadataKeys } from '../../metadata-keys';
import { HttpContentType } from './http-content-type.enum';
import { HttpEndpointOptions, IHttpEndpointOptions } from './http-endpoint-options';
import { HttpRequestType } from './http-request-type.enum';
import { IHttpTypeParameters } from './http-type-parameters';

export interface IHttpPutOptions extends IHttpEndpointOptions {
  fromBody?: (new () => any) | object;
  contentType?: HttpContentType;
}

export class HttpPutOptions extends HttpEndpointOptions implements IHttpPutOptions {
  public fromBody?: (new () => any) | object;
  public contentType?: HttpContentType;

  constructor(init?: IHttpPutOptions) {
    super(init);
    if (init) {
      this.contentType = init.contentType;
      this.fromBody = init.fromBody || undefined;
    }
  }
}

export function HttpPut(options?: IHttpPutOptions) {
  return (target: ApiController, propertyKey: string, descriptor: PropertyDescriptor) => {
    const params: IHttpTypeParameters = { type: HttpRequestType.PUT, options: new HttpPutOptions(options) };
    Reflect.defineMetadata(MetadataKeys.endpoint + propertyKey, params, target);
  };
}