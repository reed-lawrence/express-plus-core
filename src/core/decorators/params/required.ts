import "reflect-metadata";
import { MetadataKeys } from '../../metadata-keys';

export function Required() {
  return (target: object, propertyKey: string) => {
    Reflect.defineMetadata(MetadataKeys.required + propertyKey, undefined, target);
  };
}
