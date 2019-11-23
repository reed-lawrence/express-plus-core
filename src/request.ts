import { Dictionary, Request as ExpressRequest } from 'express-serve-static-core';

export interface IRequest<T, U extends Dictionary<string>> extends ExpressRequest {
  body: T;
  params: U;
}
