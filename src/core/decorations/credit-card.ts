export function CreditCard() {
  return (target: Object, propertyKey: string) => {
    Reflect.defineMetadata('datatype:creditcard', propertyKey, target);
  }
}