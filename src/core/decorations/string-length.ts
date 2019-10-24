import "reflect-metadata";
import { MetadataKeys } from "../metadata-keys";

export interface StringLegnthOptions {
  min: number;
  max: number;
}


export type StringLengthValidator = StringLegnthOptions | ((length: number) => boolean);

export function StringLength(opts: StringLengthValidator) {
  return (target: Object, propertyKey: string) => {
    Reflect.defineMetadata(MetadataKeys.strLength + propertyKey, opts, target);
  }
}