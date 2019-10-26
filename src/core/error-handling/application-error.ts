// Credit here: https://medium.com/learn-with-talkrise/custom-errors-with-node-express-27b91fe2d947

export class ApplicationError extends Error {
  public status: number = 500;
  constructor(message?: string, status?: number) {
    super();
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = message ||
      'Something went wrong. Please try again.';
    this.status = status || 500;
  }
}
