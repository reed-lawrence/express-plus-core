import { ApplicationError } from './application-error';

export class NotFoundError extends ApplicationError {
  constructor(message = 'No matching resource found') {
    super(message, 404);
  }
}
