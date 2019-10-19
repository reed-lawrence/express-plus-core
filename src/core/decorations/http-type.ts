import { ApiController } from "../controller";
import "reflect-metadata";

export function HttpType<T>(type: 'GET' | 'POST' | 'PUT' | 'DELETE', fromBody?: { new(): T }) {
  return function (target: ApiController, propertyKey: string, descriptor: PropertyDescriptor) {
    Reflect.defineMetadata('endpoint:' + propertyKey, { type, fromBody }, target);
  }
}

export interface IHttpTypeParameters<T> {
  type: 'GET' | 'POST' | 'PUT' | 'DELETE';
  fromBody?: { new(): T };
}