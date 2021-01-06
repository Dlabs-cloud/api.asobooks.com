import { IsEntityExist } from '../../common/class-validators/entity-constraint.validator';
import { IsString } from 'class-validator';

export class BankInfoRequestDto {
  @IsString()
  @IsEntityExist({
    column: 'code',
    isExist: true,
    name: 'bank',
  }, {
    message: 'Bank name does not exist',
  })
  code: string;
  @IsString()
  accountNumber: string;
}