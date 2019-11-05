import { ApplicationError } from "./application-error";
import { Dictionary, NextFunction, Request, Response } from 'express-serve-static-core';
import { DefaultErrorResponse } from "./default-error-response";

export function DefaultErrorFn(
  err: Error | ApplicationError,
  req: Request<Dictionary<string>>,
  res: Response,
  next: NextFunction) {
  if (res.headersSent) {
    return next(err)
  }
  const status = err instanceof ApplicationError ? err.status : 500;
  res.status(status).send(new DefaultErrorResponse(err));
  return next(err);
}