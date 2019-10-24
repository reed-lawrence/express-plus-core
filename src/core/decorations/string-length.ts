import "reflect-metadata";
import { MetadataKeys } from "../metadata-keys";

export interface IStringLegnthOptions {
  min: number;
  max: number;
}

export type StringLengthValidator = IStringLegnthOptions | ((length: number) => boolean);

export function StringLength(opts: StringLengthValidator) {
  return (target: object, propertyKey: string) => {
    Reflect.defineMetadata(MetadataKeys.strLength + propertyKey, opts, target);
  };
}
