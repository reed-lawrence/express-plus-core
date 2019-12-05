import { validate } from 'class-validator';
import { Dictionary, Request } from 'express-serve-static-core';

export class SchemaValidator {

  /**
   * Funciton that validates the body of an express request
   * @param req the express request object
   * @param classRef The class reference or object to validate against
   * @returns stringified error, or undefined if none
   */
  public static async ValidateBody<T extends object>(req: Request<Dictionary<string>>, classRef: (new () => T) | T) {

    // If the object passed to the classRef is a constructor, then construct it. Otherwise leave as-is.
    const obj = classRef instanceof Function ? new classRef() : classRef;

    if (req.headers["content-type"] !== 'application/json') {
      return 'Expected Content-Type header of application/json';
    }

    if (typeof req.body !== typeof obj) {
      return 'Incompatible body types';
    }

    // Assign the params of the body to the model object to be validated - keys that don't exist on the model will be ignored
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        obj[key] = req.body[key];
      }
    }

    // Validate the body according to the schema supplied by the object created/passed in from the classRef
    const errors = await validate(obj);
    if (errors.length) {
      return errors.map((e) => e.toString()).toString();
    } else {
      return;
    }
  }
}

export interface ISchemaErrors {
  missing: string[];
  invalid: string[];
}
