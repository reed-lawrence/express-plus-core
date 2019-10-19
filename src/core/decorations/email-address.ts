import "reflect-metadata";

export function EmailAddress() {
  return (target: Object, propertyKey: string) => {
    Reflect.defineMetadata('datatype:email', propertyKey, target);
  }
}