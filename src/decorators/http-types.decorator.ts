import 'reflect-metadata';
import { ApiController } from '../api-controller';
import { MetadataKeys } from '../metadata-keys';
import { HttpEndpointOptions, IHttpEndpointOptions } from './http-endpoint-options';
import { HttpPostOptions, IHttpPostOptions } from './http-post-options';
import { HttpPutOptions, IHttpPutOptions } from './http-put-options';

export enum HttpRequestType {
  GET = 1,
  POST,
  PUT,
  DELETE,
  HEAD,
  CONNECT,
  OPTIONS,
  TRACE,
}

export enum HttpContentType {
  FormData = 1,
  UrlEncoded,
  JSON,
  Any,
}

export interface IHttpTypeParameters {
  type: HttpRequestType;
  options?: HttpEndpointOptions | HttpPostOptions;
}

export function HttpConnect(options?: IHttpEndpointOptions) {
  return (target: ApiController, propertyKey: string, descriptor: PropertyDescriptor) => {
    const params: IHttpTypeParameters = { type: HttpRequestType.CONNECT, options: new HttpEndpointOptions(options) };
    Reflect.defineMetadata(MetadataKeys.endpoint + propertyKey, params, target);
  };
}

export function HttpDelete(options?: IHttpEndpointOptions) {
  return (target: ApiController, propertyKey: string, descriptor: PropertyDescriptor) => {
    const params: IHttpTypeParameters = { type: HttpRequestType.DELETE, options: new HttpEndpointOptions(options) };
    Reflect.defineMetadata(MetadataKeys.endpoint + propertyKey, params, target);
  };
}

export function HttpGet(options?: IHttpEndpointOptions) {
  return (target: ApiController, propertyKey: string, descriptor: PropertyDescriptor) => {
    const params: IHttpTypeParameters = { type: HttpRequestType.GET, options: new HttpEndpointOptions(options) };
    Reflect.defineMetadata(MetadataKeys.endpoint + propertyKey, params, target);
  };
}

export function HttpHead(options?: IHttpEndpointOptions) {
  return (target: ApiController, propertyKey: string, descriptor: PropertyDescriptor) => {
    const params: IHttpTypeParameters = { type: HttpRequestType.HEAD, options: new HttpEndpointOptions(options) };
    Reflect.defineMetadata(MetadataKeys.endpoint + propertyKey, params, target);
  };
}

export function HttpOptions(options?: IHttpEndpointOptions) {
  return (target: ApiController, propertyKey: string, descriptor: PropertyDescriptor) => {
    const params: IHttpTypeParameters = { type: HttpRequestType.OPTIONS, options: new HttpEndpointOptions(options) };
    Reflect.defineMetadata(MetadataKeys.endpoint + propertyKey, params, target);
  };
}

export function HttpPost(options?: IHttpPostOptions) {
  return (target: ApiController, propertyKey: string, descriptor: PropertyDescriptor) => {
    const params: IHttpTypeParameters = { type: HttpRequestType.POST, options: new HttpPostOptions(options) };
    Reflect.defineMetadata(MetadataKeys.endpoint + propertyKey, params, target);
  };
}

export function HttpPut(options?: IHttpPutOptions) {
  return (target: ApiController, propertyKey: string, descriptor: PropertyDescriptor) => {
    const params: IHttpTypeParameters = { type: HttpRequestType.PUT, options: new HttpPutOptions(options) };
    Reflect.defineMetadata(MetadataKeys.endpoint + propertyKey, params, target);
  };
}

export function HttpTrace(options?: IHttpEndpointOptions) {
  return (target: ApiController, propertyKey: string, descriptor: PropertyDescriptor) => {
    const params: IHttpTypeParameters = { type: HttpRequestType.TRACE, options: new HttpEndpointOptions(options) };
    Reflect.defineMetadata(MetadataKeys.endpoint + propertyKey, params, target);
  };
}
