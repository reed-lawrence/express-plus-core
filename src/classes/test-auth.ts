import { Dictionary, NextFunction, Request, Response } from 'express-serve-static-core';
import { UnauthorizedError } from '../core/error-handling/unauthorized-error';
import { HttpContext } from '../core/http-context';

export function TestAuth(req: Request<Dictionary<string>>, res: Response, next: NextFunction): Promise<HttpContext> {
  return new Promise((resolve, reject) => {
    if (req.headers.sessiontoken === '123456') {
      res.locals.user = { userId: 1 };
      resolve();
      next();
    } else {
      throw new UnauthorizedError();
    }
  });
}
