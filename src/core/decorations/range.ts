import "reflect-metadata";
import { MetadataKeys } from "../metadata-keys";

export interface RangeOptions {
  start: number;
  end: number;
}
export type RangeValidator = RangeOptions | ((o: number) => boolean);

export function Range(opts: RangeValidator) {
  return (target: Object, propertyKey: string) => {
    Reflect.defineMetadata(MetadataKeys.range + propertyKey, opts, target);
  }
}