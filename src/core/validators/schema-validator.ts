import { Request, Dictionary } from "express-serve-static-core";
import "reflect-metadata";
import { Utils } from "../utils";
import { RangeValidator } from "../decorations/range";
import { StringLengthValidator } from "../decorations/string-length";
import { MetadataKeys } from "../metadata-keys";



export class SchemaValidator {
  public static ValidateBody<T extends Object>(req: Request<Dictionary<string>>, classRef: { new(): T } | T) {
    console.log(typeof classRef);
    const obj = classRef instanceof Function ? new classRef() : classRef;
    if (req.headers["content-type"] !== 'application/json') {
      throw new Error('Expected Content-Type header of application/json');
    }

    if (typeof req.body !== typeof obj) {
      throw new Error('Incompatible body types')
    }
    const schemaErrors = this.validateSchema(req.body, obj);
    if (schemaErrors.missing.length || schemaErrors.invalid.length) {
      throw new Error(this.schemaErrorsToString(schemaErrors));
    }
    return;
  }

  private static validateSchema<T extends Object>(body: any, obj: T): ISchemaErrors {
    console.log(obj);
    const missingParams: string[] = [];
    const invalidParams: string[] = [];

    this.validateObjects(body, obj);


    const metadataKeys: string[] = Reflect.getMetadataKeys(obj).sort((a, b) => {
      return a.indexOf(MetadataKeys.required) !== -1 ? -1 : 1;
    });
    for (const metaKey of metadataKeys) {

      const paramName = metaKey.split(':')[2];
      const paramValue = Reflect.getMetadata(metaKey, obj);
      const key = Utils.getKey(paramName, body);

      if (metaKey.indexOf(MetadataKeys.required) !== -1) {
        if (key && !this.ValidateRequired(body[key])) {
          throw new Error('Invalid format parameter [' + paramName + '] was not supplied');
        }
      } else if (metaKey.indexOf(MetadataKeys.email) !== -1) {
        if (key && !this.validateEmail(body[key] as any)) {
          invalidParams.push('Invalid format [Email] on ' + paramName);
        }
      } else if (metaKey.indexOf(MetadataKeys.range) !== -1) {
        if (key && !this.ValidateRange(body[key], paramValue)) {
          invalidParams.push('Invalid format [Range] on ' + paramName);
        }
      } else if (metaKey.indexOf(MetadataKeys.strLength) !== -1) {
        if (key && !this.ValidateStringLength(body[key], paramValue)) {
          invalidParams.push('Invalid format [StringLength] on ' + paramName);
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
    return value ? regex.test(value) : true;
  }

  private static ValidateRange(value: number, validator: RangeValidator) {
    if (!value) {
      return true;
    } else if (typeof value !== 'number') {
      throw new Error('Value provided for @Range() is not a numeric type.');
    }

    if (validator instanceof Function) {
      return validator(value);
    } else if (validator instanceof Object) {
      return value >= validator.start && value <= validator.end;
    } else {
      throw new Error('Invalid validator parameters supplied to @Range() decorator');
    }
  }

  private static ValidateStringLength(value: string, validator: StringLengthValidator) {
    if (!value) {
      return true;
    } else if (typeof value !== 'string') {
      throw new Error('Value provided for @StringLength() is not a string type.');
    }

    if (validator instanceof Function) {
      return validator(value.length);
    } else if (validator instanceof Object) {
      return value.length >= validator.min && value.length <= validator.max;
    } else {
      throw new Error('Invalid validator parameters supplied to @StringLength() decorator');
    }
  }

  private static ValidateRequired(value: any) {
    return value ? true : false;
  }

  private static validateObjects<T extends Object>(target: any, model: T, targetParamName?: string) {
    for (const key in model) {
      if (target === null) {
        throw new Error('Invalid schema error: Object expected, recieved null' + (' at: ' + targetParamName) || '');
      }
      if (!target.hasOwnProperty(key)) {
        throw new Error('Missing/undefined property in payload: ' + (targetParamName ? targetParamName + '.' + key : key));
      } else if (model[key] instanceof Object) {
        this.validateObjects(target[key], model[key], targetParamName ? targetParamName + '.' + key : key);
      }
    }
  }
}

export interface ISchemaErrors {
  missing: string[];
  invalid: string[];
}