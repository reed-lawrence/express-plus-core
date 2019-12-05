import { Dictionary, Request as ExpressRequest } from 'express-serve-static-core';

export interface IPartialDictionary { [key: string]: string | undefined; }

export interface IRequest<T, U extends IPartialDictionary, Q extends IPartialDictionary> extends Omit<ExpressRequest, 'params'> {
  body: T;
  params: U;
  query: Q;
  method: 'GET' | 'POST' | 'CONNECT' | 'HEAD' | 'DELETE' | 'TRACE' | 'PUT' | 'TRACE';
}

export interface IShape {
  id: number;
  value: string;
}

export interface IFoo {
  test: IShape;
}

export interface IBar extends Omit<IFoo, 'test'> {
  test: Partial<IFoo['test']>;
}
