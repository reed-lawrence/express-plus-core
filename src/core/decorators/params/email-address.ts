import "reflect-metadata";
import { MetadataKeys } from "../../metadata-keys";

export function EmailAddress() {
  return (target: object, propertyKey: string) => {
    Reflect.defineMetadata(MetadataKeys.email + propertyKey, undefined, target);
  };
}
