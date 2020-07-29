import {
  registerDecorator,
  ValidationArguments, ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { getConnection } from 'typeorm';
import { GenericStatusConstant } from '../../domain/enums/generic-status-constant';

export function IsEntityExist(param: EntityConstraintParam, options?: ValidationOptions) {
  return function(object: Object, propertyName: string) {
    registerDecorator({
      constraints: [param],
      options,
      propertyName,
      target: object.constructor,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const param = args.constraints[0] as EntityConstraintParam;
          if (!value) {
            return Promise.resolve(true);

          }
          const isExists = param.isExist;
          return getConnection()
            .getRepository(param.name)
            .createQueryBuilder('entity')
            .where(`entity.${param.column} = :column`)
            .andWhere(`entity.status = :status`)
            .setParameter('column', value)
            .setParameter('status', GenericStatusConstant.ACTIVE)
            .getCount().then(count => {
              return isExists && count ? true :
                isExists && !count ? false :
                  !isExists && count ? false :
                    !isExists && !count ? true : !!count;
            });

        },
      },

    });
  };

}


export interface EntityConstraintParam {
  name: string;
  column: string,
  isExist: boolean
  status?: GenericStatusConstant;
}