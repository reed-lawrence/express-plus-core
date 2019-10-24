import "reflect-metadata";
import { MetadataKeys } from '../metadata-keys';

export function Required() {
  return (target: Object, propertyKey: string) => {
    Reflect.defineMetadata(MetadataKeys.required + propertyKey, undefined, target);
  }
}