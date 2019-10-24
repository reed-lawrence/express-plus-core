import "reflect-metadata";

export const requiredMetaKey = 'datatype:required:';

export function Required() {
  return (target: Object, propertyKey: string) => {
    Reflect.defineMetadata(requiredMetaKey + propertyKey, undefined, target);
  }
}