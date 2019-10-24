import "reflect-metadata";

export interface RangeOptions {
  start: number;
  end: number;
}

export const rangeMetaKey = 'datatype:range:';
export type RangeValidator = RangeOptions | ((o: number) => boolean);

export function Range(opts: RangeValidator) {
  return (target: Object, propertyKey: string) => {
    Reflect.defineMetadata(rangeMetaKey + propertyKey, opts, target);
  }
}