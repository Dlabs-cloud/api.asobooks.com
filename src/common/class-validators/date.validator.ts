import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';
import * as moment from 'moment';

export function IsValidDate(param: DateValidator, options?: ValidationOptions) {

  return function(object: Object, propertyName: string) {
    registerDecorator({
      constraints: [param],
      options,
      propertyName,
      target: object.constructor,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const param = args.constraints[0] as DateValidator;


          if (!value) {
            return Promise.resolve(true);
          }
          let momentDate = moment(value, param.format).startOf('day');
          const date = moment().startOf('day');
          if (param.isBefore) {
            return momentDate.isValid() && date.isSameOrAfter(momentDate);
          }
          return momentDate.isValid() && date.isSameOrBefore(momentDate);
        },
      },
    });
  };
}


export class DateValidator {
  isBefore: boolean;
  format: string;
}