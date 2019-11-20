import 'reflect-metadata';

import { CorsOptions } from 'cors';
import { Dictionary, NextFunction, Request, Response } from 'express-serve-static-core';

import { ApiController } from '../api-controller';
import { MetadataKeys } from '../metadata-keys';
import { Utils } from '../utils';

export enum HttpRequestType {
  GET = 1,
  POST,
  PUT,
  DELETE,
  HEAD,
  CONNECT,
  OPTIONS,
  TRACE
}

export enum HttpContentType {
  FormData = 1,
  UrlEncoded,
  JSON,
}

export interface IHttpTypeParameters {
  type: HttpRequestType;
  options?: HttpEndpointOptions | HttpPostOptions;
}

export interface IHttpEndpointOptions {
  route?: string;
  errorHandler?: (err: Error, req: Request<Dictionary<string>>, res: Response, next: NextFunction) => any;
  authenticate?: boolean;
  authMethod?: (req: Request<Dictionary<string>>, res: Response, next: NextFunction) => Promise<any>;
  cors?: CorsOptions | false;
}

export class HttpEndpointOptions implements IHttpEndpointOptions {
  public route?: string;
  public errorHandler?: (err: Error, req: Request<Dictionary<string>>, res: Response, next: NextFunction) => any;
  public authenticate?: boolean;
  public authMethod?: (req: Request<Dictionary<string>>, res: Response, next: NextFunction) => Promise<any>;
  public cors?: CorsOptions | false;

  constructor(init?: IHttpEndpointOptions) {
    if (init) {
      this.route = init.route ? Utils.trimRoute(init.route) : undefined;
      this.errorHandler = init.errorHandler || undefined;
      this.authenticate = init.authenticate || undefined;
      this.authMethod = init.authMethod || undefined;
      this.cors = init.cors || undefined;
    }
  }
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

export function HttpTrace(options?: IHttpEndpointOptions) {
  return (target: ApiController, propertyKey: string, descriptor: PropertyDescriptor) => {
    const params: IHttpTypeParameters = { type: HttpRequestType.TRACE, options: new HttpEndpointOptions(options) };
    Reflect.defineMetadata(MetadataKeys.endpoint + propertyKey, params, target);
  };
}