import { IsEntityExist } from '../../common/class-validators/entity-constraint.validator';
import { IsString } from 'class-validator';

export class BankInfoRequestDto {
  @IsEntityExist({
    column: 'code',
    isExist: true,
    name: 'bank',
  }, {
    message: 'Bank name does not exist',
  })
  bankCode: string;
  @IsString()
  accountNumber: string;
}