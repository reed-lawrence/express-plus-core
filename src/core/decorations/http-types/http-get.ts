import 'reflect-metadata';
import { ApiController } from "../../controller";
import { IHttpEndpointOptions, HttpEndpointOptions } from '../../api-endpoint';
import { IHttpTypeParameters } from "./http-type-parameters";
import { HttpRequestType } from "./http-request-type.enum";
import { MetadataKeys } from '../../metadata-keys';

export function HttpGet(options?: IHttpEndpointOptions) {
  return function (target: ApiController, propertyKey: string, descriptor: PropertyDescriptor) {
    const params: IHttpTypeParameters = { type: HttpRequestType.GET, options: new HttpEndpointOptions(options) }
    Reflect.defineMetadata(MetadataKeys.endpoint + propertyKey, params, target);
  }
}