import "reflect-metadata";
import { MetadataKeys } from '../../metadata-keys';

export function Optional() {
  return (target: object, propertyKey: string) => {
    Reflect.defineMetadata(MetadataKeys.optional + propertyKey, undefined, target);
  };
}