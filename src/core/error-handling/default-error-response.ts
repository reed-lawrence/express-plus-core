import { ApplicationError } from "./application-error";
import { Utils } from "../utils";

export interface IDefaultErrorResponse {
  message: string;
  status: number;
  name: string;
}

export class DefaultErrorResponse implements IDefaultErrorResponse {
  name: string;
  message: string;
  status: number;

  constructor(init?: Partial<Error | ApplicationError>) {
    this.name = init && init.name && init.name !== 'Error' ? init.name : 'ApplicationError';
    this.message = init && init.message ? init.message : 'Something went wrong. Please try again.';
    this.status = init && init instanceof ApplicationError && init.status ? init.status : 500;
  }
}