import { ApplicationError } from './application-error';

export class UnauthorizedError extends ApplicationError {
  constructor(message: string = 'Insufficient Permission') {
    super(message, 401);
  }
}
