import { Request } from "express-serve-static-core";
import "reflect-metadata";
import { Utils } from "../utils";


export class SchemaValidator {
  public static ValidateBody<T extends Object>(req: Request<string[]>, classRef: { new(): T } | T) {
    console.log(typeof classRef);
    const obj = classRef instanceof Function ? new classRef() : classRef;
    if (typeof req.body !== typeof obj) {
      throw new Error('Incompatible body types')
    }
    const schemaErrors = this.validateSchema(req.body, obj);
    if (schemaErrors.missing.length || schemaErrors.invalid.length) {
      throw new Error(this.schemaErrorsToString(schemaErrors));
    }
  }

  private static validateSchema<T extends Object>(body: any, obj: T): ISchemaErrors {
    console.log(obj);
    const missingParams: string[] = [];
    const invalidParams: string[] = [];

    Object.keys(obj).forEach(key => {
      if (!body.hasOwnProperty(key)) {
        missingParams.push(key);
      }
    });
    const metadataKeys: string[] = Reflect.getMetadataKeys(obj);
    for (const metaKey of metadataKeys) {
      const paramName = Reflect.getMetadata(metaKey, obj);
      const key = Utils.getKey(paramName, body);
      if (metaKey.indexOf('datatype:email') !== -1) {
        if (key && !this.validateEmail(body[key] as any)) {
          invalidParams.push('Invalid format [Email] on ' + paramName);
        }
      }
    }
    return { missing: missingParams, invalid: invalidParams };
  }

  private static schemaErrorsToString(errors: ISchemaErrors): string {
    let output = 'Model Validation Error(s):';
    if (errors.missing.length) {
      output += '\nMissing parameters in request: ';
      for (let i = 0; i < errors.missing.length; i++) {
        output += i === 0 ? errors.missing[i] : ', ' + errors.missing[i];
      }
    }

    if (errors.invalid.length) {
      output += '\nInvalid parameters in request: ';
      for (let i = 0; i < errors.invalid.length; i++) {
        output += i === 0 ? errors.invalid[i] : ', ' + errors.invalid[i];
      }
    }

    return output;
  }

  private static validateEmail(value: string) {
    const regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return regex.test(value);
  }
}

export interface ISchemaErrors {
  missing: string[];
  invalid: string[];
}