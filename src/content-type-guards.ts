import {
  Dictionary,
  NextFunction,
  Request,
  Response,
} from 'express-serve-static-core';
import { BadRequestError } from './error-handlers/bad-request-error';

export function jsonGuardMiddleware(req: Request<Dictionary<string>>, res: Response, next: NextFunction) {
  if (req.headers["content-type"] && req.headers["content-type"].toLowerCase().indexOf('application/json') !== -1) {
    next();
  } else {
    next(new BadRequestError('Supplied header content-type not allowed'));
  }
  return;
}

export function formDataGuardMiddleware(req: Request<Dictionary<string>>, res: Response, next: NextFunction) {
  if (req.headers["content-type"] && req.headers["content-type"].toLowerCase().indexOf('multipart/form-data') !== -1) {
    next();
  } else {
    next(new BadRequestError('Supplied header content-type not allowed'));
  }
  return;
}

export function urlEncodedGuardMiddleware(req: Request<Dictionary<string>>, res: Response, next: NextFunction) {
  if (req.headers["content-type"] && req.headers["content-type"].toLowerCase().indexOf('application/x-www-form-urlencoded') !== -1) {
    next();
  } else {
    next(new BadRequestError('Supplied header content-type not allowed'));
  }
  return;
}
