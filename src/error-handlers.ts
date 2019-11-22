
import { Dictionary, NextFunction, Request, Response } from 'express-serve-static-core';

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

export interface IDefaultErrorResponse {
  message: string;
  status: number;
  name: string;
}

export class DefaultErrorResponse implements IDefaultErrorResponse {
  public name: string;
  public message: string;
  public status: number;

  constructor(init?: Partial<Error | ApplicationError>) {
    this.name = init && init.name && init.name !== 'Error' ? init.name : 'ApplicationError';
    this.message = init && init.message ? init.message : 'Something went wrong. Please try again.';
    this.status = init && init instanceof ApplicationError && init.status ? init.status : 500;
  }
}

// Credit here: https://medium.com/learn-with-talkrise/custom-errors-with-node-express-27b91fe2d947

export class ApplicationError extends Error {
  public status: number = 500;
  constructor(message?: string, status?: number) {
    super();
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = message ||
      'Something went wrong. Please try again.';
    this.status = status || 500;
  }
}

export class BadRequestError extends ApplicationError {
  constructor(message = 'Bad request from client') {
    super(message, 400);
  }
}

export class ConflictError extends ApplicationError {
  constructor(message = 'The request could not be completed due to a conflict with the current state of the resource.') {
    super(message, 409);
  }
}

export class ForbiddenError extends ApplicationError {
  constructor(message = 'Access forbidden') {
    super(message, 403);
  }
}

export class NotFoundError extends ApplicationError {
  constructor(message = 'No matching resource found') {
    super(message, 404);
  }
}

export class UnauthorizedError extends ApplicationError {
  constructor(message: string = 'Insufficient Permission') {
    super(message, 401);
  }
}