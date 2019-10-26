import { ApplicationError } from './application-error';

export class ForbiddenError extends ApplicationError {
  constructor(message = 'Access forbidden') {
    super(message, 403);
  }
}
