import { HttpContext } from '../core/http-context';

export function BadRequest(context: HttpContext, body?: any) {
  return context.response.status(400).send(body);
}

export function Ok(context: HttpContext, body?: any) {
  return context.response.send(body);
}