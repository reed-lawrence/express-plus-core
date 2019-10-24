import { ApiController } from "../../controller";
import { IHttpEndpointOptions, HttpEndpointOptions } from '../../api-endpoint';
import { IHttpTypeParameters } from "./http-type-parameters";
import { HttpRequestType } from "./http-request-type.enum";

export function HttpGet<T>(options?: IHttpEndpointOptions) {
  return function (target: ApiController<T>, propertyKey: string, descriptor: PropertyDescriptor) {
    const params: IHttpTypeParameters<T> = { type: HttpRequestType.GET, options: new HttpEndpointOptions(options) }
    Reflect.defineMetadata('endpoint:' + propertyKey, params, target);
  }
}