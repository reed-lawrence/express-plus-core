import 'reflect-metadata';

import { ApiController } from '../../controller';
import { MetadataKeys } from '../../metadata-keys';
import { HttpEndpointOptions, IHttpEndpointOptions } from './http-endpoint-options';
import { HttpRequestType } from './http-request-type.enum';
import { IHttpTypeParameters } from './http-type-parameters';

export function HttpGet(options?: IHttpEndpointOptions) {
  return (target: ApiController, propertyKey: string, descriptor: PropertyDescriptor) => {
    const params: IHttpTypeParameters = { type: HttpRequestType.GET, options: new HttpEndpointOptions(options) };
    Reflect.defineMetadata(MetadataKeys.endpoint + propertyKey, params, target);
  };
}
