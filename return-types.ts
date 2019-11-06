import { Response } from 'express-serve-static-core';

export function Ok(res: Response, body?: unknown) {
  return res.status(200).send(body);
}

export function Created(res: Response, body?: unknown) {
  return res.status(201).send(body);
}

export function NoContent(res: Response) {
  return res.status(204).send();
}

export function NotModified(res: Response, body?: unknown) {
  return res.status(304).send(body);
}
