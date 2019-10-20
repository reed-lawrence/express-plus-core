import "reflect-metadata";

export const emailMetaKey = 'datatype:email:';

export function EmailAddress() {
  return (target: Object, propertyKey: string) => {
    Reflect.defineMetadata(emailMetaKey + propertyKey, undefined, target);
  }
}