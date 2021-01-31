import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';
import * as moment from 'moment';
import { DateValidator } from './date.validator';

export function IsDateFormat(format: string, options?: ValidationOptions) {

  return function(object: Object, propertyName: string) {
    registerDecorator({
      constraints: [format],
      options,
      propertyName,
      target: object.constructor,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const format = args.constraints[0] as string;
          if (!value) {
            return Promise.resolve(true);
          }
          let momentDate = moment(value, format);
          return momentDate.isValid();
        },
      },
    });
  };
};

