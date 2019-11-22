import {
  Dictionary,
  NextFunction,
  Request,
  Response,
} from 'express-serve-static-core';
import { ApplicationError } from './application-error';
import { DefaultErrorResponse } from './default-error-response';

export function DefaultErrorFn(
  err: Error | ApplicationError,
  req: Request<Dictionary<string>>,
  res: Response,
  next: NextFunction) {
  if (res.headersSent) {
    // console.log('headers sent');
    // return next(err);
    return;
  }
  const status = err instanceof ApplicationError ? err.status : 500;
  return res.status(status).send(new DefaultErrorResponse(err));
}
