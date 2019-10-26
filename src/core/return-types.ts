import { HttpContext } from '../core/http-context';

export function ServerError(context: HttpContext, params?: { err?: Error; body?: unknown }) {
  context.response.status(500).send(params && params.body ? params.body : 'Internal Server Error');
  return context.next(params && params.err ? params.err : new Error('Internal Server Error'));
}

export function BadRequest(context: HttpContext, body?: unknown) {
  return context.response.status(400).send(body);
}

export function Ok(context: HttpContext, body?: unknown) {
  return context.response.send(body);
}
