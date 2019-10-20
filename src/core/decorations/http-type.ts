import { ApiController } from "../controller";
import "reflect-metadata";

export interface IHttpTypeOptions {
  fromBody?: { new(): any },
  route?: string;
}

export function HttpType<T>(type: 'GET' | 'POST' | 'PUT' | 'DELETE', options?: IHttpTypeOptions) {
  return function (target: ApiController<T>, propertyKey: string, descriptor: PropertyDescriptor) {
    Reflect.defineMetadata('endpoint:' + propertyKey, { type, options }, target);
  }
}

export interface IHttpTypeParameters<T> {
  type: 'GET' | 'POST' | 'PUT' | 'DELETE';
  options?: IHttpTypeOptions;
}