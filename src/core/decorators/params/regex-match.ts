import "reflect-metadata";
import { MetadataKeys } from "../../metadata-keys";


export function RegexMatch(pattern: RegExp) {
  return (target: object, propertyKey: string) => {
    Reflect.defineMetadata(MetadataKeys.regex + propertyKey, pattern, target);
  };
}