import "reflect-metadata";

export interface StringLegnthOptions {
  min: number;
  max: number;
}

export const stringLengthMetaKey = 'datatype:stringlength:';
export type StringLengthValidator = StringLegnthOptions | ((length: number) => boolean);

export function StringLength(opts: StringLengthValidator) {
  return (target: Object, propertyKey: string) => {
    Reflect.defineMetadata(stringLengthMetaKey + propertyKey, opts, target);
  }
}