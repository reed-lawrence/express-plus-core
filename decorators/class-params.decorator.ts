import "reflect-metadata";
import { MetadataKeys } from "../lib/metadata-keys";

export function EmailAddress() {
  return (target: object, propertyKey: string) => {
    Reflect.defineMetadata(MetadataKeys.email + propertyKey, undefined, target);
  };
}

export function Optional() {
  return (target: object, propertyKey: string) => {
    Reflect.defineMetadata(MetadataKeys.optional + propertyKey, undefined, target);
  };
}

export interface IRangeOptions {
  start: number;
  end: number;
}
export type RangeValidator = IRangeOptions | ((o: number) => boolean);

export function Range(opts: RangeValidator) {
  return (target: object, propertyKey: string) => {
    Reflect.defineMetadata(MetadataKeys.range + propertyKey, opts, target);
  };
}

export function RegexMatch(pattern: RegExp) {
  return (target: object, propertyKey: string) => {
    Reflect.defineMetadata(MetadataKeys.regex + propertyKey, pattern, target);
  };
}

export function Required() {
  return (target: object, propertyKey: string) => {
    Reflect.defineMetadata(MetadataKeys.required + propertyKey, undefined, target);
  };
}

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