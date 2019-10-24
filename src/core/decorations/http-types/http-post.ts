import 'reflect-metadata';
import { HttpContentType } from "./http-content-type.enum";
import { IHttpEndpointOptions, HttpEndpointOptions } from "../../api-endpoint";
import { ApiController } from "../../controller";
import { IHttpTypeParameters } from './http-type-parameters';
import { HttpRequestType } from './http-request-type.enum';
import { MetadataKeys } from '../../metadata-keys';

export interface IHttpPostOptions extends IHttpEndpointOptions {
  fromBody?: { new(): any } | Object;
  contentType?: HttpContentType;
}

export class HttpPostOptions extends HttpEndpointOptions implements IHttpPostOptions {
  fromBody?: { new(): any } | Object;
  contentType?: HttpContentType;

  constructor(init?: IHttpPostOptions) {
    super(init);
    if (init) {
      this.contentType = init.contentType;
      this.fromBody = init.fromBody || undefined;
    }
  }
}

export function HttpPost(options?: IHttpPostOptions) {
  return function (target: ApiController, propertyKey: string, descriptor: PropertyDescriptor) {
    const params: IHttpTypeParameters = { type: HttpRequestType.POST, options: new HttpPostOptions(options) };
    Reflect.defineMetadata(MetadataKeys.endpoint + propertyKey, params, target);
  }
}