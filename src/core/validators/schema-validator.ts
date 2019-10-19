import { Request } from "express-serve-static-core";
import "reflect-metadata";


export class SchemaValidator {
  public static ValidateBody<T>(req: Request<string[]>, classRef: { new(): T }) {
    const obj = new classRef();
    const metadataKeys = Reflect.getMetadataKeys(obj);
    console.log(metadataKeys);

  }

  private static validateSchema<T>(body: any, obj: T) {
    const missingParams: string[] = [];
    const wrongSchemaParams: string[] = [];
    if (typeof body === typeof obj) {
      for (const objKey in obj) {
        let exists = false;
        for (const bodyKey in body) {
          if (objKey === bodyKey) {
            exists = true;

            

          }
        }

        if (!exists) {
          missingParams.push(objKey);
        }
      }
    }
    return missingParams;
  }
}