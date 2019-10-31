import { ApplicationError } from './application-error';

export class ConflictError extends ApplicationError {
  constructor(message = 'The request could not be completed due to a conflict with the current state of the resource.') {
    super(message, 409);
  }
}