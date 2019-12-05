import { registerDecorator, ValidationArguments, ValidationOptions } from "class-validator";

export function IsRequired(validationOptions?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    const defaultMsg = `${propertyName} is required and must be defined`;
    const opts: ValidationOptions = { message: defaultMsg };
    if (validationOptions) {
      opts.always = validationOptions.always;
      opts.context = validationOptions.context;
      opts.each = validationOptions.each;
      opts.groups = validationOptions.groups;
      opts.message = validationOptions.message || defaultMsg;
    }
    registerDecorator({
      constraints: [defaultMsg],
      name: 'isRequired',
      options: opts,
      propertyName,
      target: object.constructor,
      validator: {
        validate(value: any, args: ValidationArguments) {
          return value !== undefined;
        },
      },
    });
  };
}
