import "reflect-metadata";
import { MetadataKeys } from "../metadata-keys";

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
