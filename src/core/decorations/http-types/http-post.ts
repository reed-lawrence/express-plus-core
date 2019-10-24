import 'reflect-metadata';
import { HttpContentType } from "./http-content-type.enum";
import { IHttpEndpointOptions, HttpEndpointOptions } from "../../api-endpoint";
import { ApiController } from "../../controller";
import { IHttpTypeParameters } from './http-type-parameters';
import { HttpRequestType } from './http-request-type.enum';

export interface IHttpPostOptions<T> extends IHttpEndpointOptions {
  fromBody?: { new(): any } | Object;
  contentType?: HttpContentType;
}

export class HttpPostOptions<T> extends HttpEndpointOptions implements IHttpPostOptions<T>{
  fromBody?: { new(): any } | Object;
  contentType?: HttpContentType;

  constructor(init?: IHttpPostOptions<T>) {
    super(init);
    if (init) {
      this.contentType = init.contentType;
      this.fromBody = init.fromBody || undefined;
    }
  }
}

export function HttpPost<T>(options?: IHttpPostOptions<T>) {
  return function (target: ApiController<T>, propertyKey: string, descriptor: PropertyDescriptor) {
    const params: IHttpTypeParameters<T> = { type: HttpRequestType.POST, options: new HttpPostOptions(options) };
    Reflect.defineMetadata('endpoint:' + propertyKey, params, target);
  }
}