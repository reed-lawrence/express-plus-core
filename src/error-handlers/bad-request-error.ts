import { ApplicationError } from "./application-error";

export class BadRequestError extends ApplicationError {
  constructor(message = 'Bad request from client') {
    super(message, 400);
  }
}
