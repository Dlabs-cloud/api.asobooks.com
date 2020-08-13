import { IsNotEmpty, IsString } from 'class-validator';
import { IsEntityExist } from '../../common/class-validators/entity-constraint.validator';

export class AssociationAddressRequestDto {
  @IsString()
  @IsNotEmpty()
  address: string;
  @IsString()
  @IsNotEmpty()
  @IsEntityExist({
    column: 'code',
    isExist: true,
    name: 'country',

  }, {
    message: 'Country with code does not exist',
  })
  countryCode: string;
}