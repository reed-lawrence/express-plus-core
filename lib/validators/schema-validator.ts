import 'reflect-metadata';

import { Dictionary, Request } from 'express-serve-static-core';
import { MetadataKeys } from '../metadata-keys';
import { Utils } from '../utils';
import { RangeValidator, StringLengthValidator } from '../../decorators/class-params.decorator';

export class SchemaValidator {

  /**
   * Funciton that validates the body of an express request
   * @param req the express request object
   * @param classRef The class reference or object to validate against
   * @returns stringified error, or undefined if none
   */
  public static ValidateBody<T extends object>(req: Request<Dictionary<string>>, classRef: (new () => T) | T) {

    // If the object passed to the classRef is a constructor, then construct it. Otherwise leave as-is.
    const obj = classRef instanceof Function ? new classRef() : classRef;

    if (req.headers["content-type"] !== 'application/json') {
      return 'Expected Content-Type header of application/json';
    }

    if (typeof req.body !== typeof obj) {
      return 'Incompatible body types';
    }

    // Validate the body according to the schema supplied by the object created/passed in from the classRef
    const schemaErrors = this.validateSchema(req.body, obj);

    if (schemaErrors.missing.length || schemaErrors.invalid.length) {
      return this.schemaErrorsToString(schemaErrors);
    }
    return;
  }

  /**
   * Function that compares metadata and object parameters against the body of a request and identifies any missing or invalid params
   * @param body The body of the incoming request
   * @param obj the target object to validate against
   * @returns in object of missing and invalid parameters
   */
  private static validateSchema<T extends object>(body: any, obj: T): ISchemaErrors {
    console.log(obj);
    const missingParams: string[] = [];
    const invalidParams: string[] = [];

    const objDiff = this.validateObjects(body, obj);
    if (objDiff) {
      missingParams.push(objDiff);
    }

    const metadataKeys: string[] = Reflect.getMetadataKeys(obj).sort((a, b) => {
      return a.indexOf(MetadataKeys.required) !== -1 ? -1 : 1;
    });
    for (const metaKey of metadataKeys) {

      const paramName = metaKey.split(':')[2];
      const paramValue = Reflect.getMetadata(metaKey, obj);
      const key = Utils.getKey(paramName, body);

      if (metaKey.indexOf(MetadataKeys.required) !== -1) {
        if (key && !this.validateRequired(body[key])) {
          invalidParams.push(`Invalid format parameter [${paramName}] was not supplied`);
        }
      } else if (metaKey.indexOf(MetadataKeys.email) !== -1) {
        if (key && !this.validateEmail(body[key] as any)) {
          invalidParams.push(`Invalid format [Email] on ${paramName}`);
        }
      } else if (metaKey.indexOf(MetadataKeys.range) !== -1) {
        if (key && !this.validateRange(body[key], paramValue)) {
          invalidParams.push(`Invalid format [Range] on ${paramName}`);
        }
      } else if (metaKey.indexOf(MetadataKeys.strLength) !== -1) {
        if (key && !this.validateStringLength(body[key], paramValue)) {
          invalidParams.push(`Invalid format [StringLength] on ${paramName}`);
        }
      } else if (metaKey.indexOf(MetadataKeys.regex) !== -1) {
        if (key && !this.validateRegex(body[key], paramValue)) {
          invalidParams.push(`Invalid format [Regex] on ${paramName}`);
        }
      }
    }
    return { missing: missingParams, invalid: invalidParams };
  }



  private static validateEmail(value: string) {
    const regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return value ? regex.test(value) : true;
  }

  private static validateRange(value: number, validator: RangeValidator) {
    if (!value) {
      return true;
    } else if (typeof value !== 'number') {
      console.error('Value provided for @Range() is not a numeric type.');
      return undefined;
    }

    if (validator instanceof Function) {
      return validator(value);
    } else if (validator instanceof Object) {
      return value >= validator.start && value <= validator.end;
    } else {
      console.error('Invalid validator parameters supplied to @Range() decorator');
      return undefined;
    }
  }

  private static validateStringLength(value: string, validator: StringLengthValidator) {
    if (!value) {
      return true;
    } else if (typeof value !== 'string') {
      console.error('Value provided for @StringLength() is not a string type.');
      return undefined;
    }

    if (validator instanceof Function) {
      return validator(value.length);
    } else if (validator instanceof Object) {
      return value.length >= validator.min && value.length <= validator.max;
    } else {
      console.error('Invalid validator parameters supplied to @StringLength() decorator');
      return undefined;
    }
  }

  private static validateRequired(value: any) {
    return value ? true : false;
  }

  private static validateRegex(value: any, validator: RegExp) {
    if (!value) {
      return true;
    } else if (!validator) {
      return undefined;
    } else {
      return validator.test(value);
    }
  }

  /**
   * Function that validates objects parameter existence of a target compared to a model object.
   * @param target the incoming object to compare
   * @param model the model object to compare against
   * @param targetParamName the parameter name in the case of a complex or nested object.
   */
  private static validateObjects<T extends object>(
    target: any,
    model: T,
    targetParamName?: string): string | undefined {
    for (const key in model) {
      const metaKeys = Reflect.getMetadataKeys(model);
      const optional = metaKeys.indexOf(MetadataKeys.optional + key) !== -1;
      if (model.hasOwnProperty(key)) {
        if (target === null) {
          return `Invalid schema error: Object expected, recieved null at: ${targetParamName || ''}`;
        }
        if (!target.hasOwnProperty(key) && !optional) {
          return `Missing or undefined property in payload: ${targetParamName ? `${targetParamName}.${key}` : key}`;
        } else if (model[key] instanceof Object) {

          // Nested objects should deeply validate
          return this.validateObjects<any>(target[key], model[key], targetParamName ? `${targetParamName}.${key}` : key);
        }
      } else {
        return 'Property does not correspond to key in model';
      }
    }
    return;
  }

  private static schemaErrorsToString(errors: ISchemaErrors): string {
    let output = 'Model Validation Error(s):';
    if (errors.missing.length) {
      output += '| Missing parameters in request: ';
      for (let i = 0; i < errors.missing.length; i++) {
        output += i === 0 ? errors.missing[i] : ', ' + errors.missing[i];
      }
    }

    if (errors.invalid.length) {
      output += '| Invalid parameters in request: ';
      for (let i = 0; i < errors.invalid.length; i++) {
        output += i === 0 ? errors.invalid[i] : ', ' + errors.invalid[i];
      }
    }

    return output;
  }
}

export interface ISchemaErrors {
  missing: string[];
  invalid: string[];
}
