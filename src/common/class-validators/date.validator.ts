import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';
import * as moment from 'moment';

export function IsDateFormat(param: DateValidator, options?: ValidationOptions) {

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
          let momentDate = moment(value, param.format);
          if (param.isBefore) {
            let todayDate = moment().format(param.format);
            return momentDate.isValid() && momentDate.isBefore(todayDate);
          }
          return momentDate.isValid() && momentDate.isSameOrAfter();
        },
      },
    });
  };
}


export class DateValidator {
  isBefore: boolean;
  format: string;
}