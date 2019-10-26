import { Response } from 'express-serve-static-core';
import { HttpContext } from '../core/http-context';
import { ApplicationError } from './error-handling/application-error';

export function Ok(res: Response, body?: unknown) {
  return res.status(200).send(body);
}

export function Created(res: Response, body?: unknown) {
  return res.status(201).send(body);
}

export function NoContent(res: Response) {
  return res.status(204).send();
}
