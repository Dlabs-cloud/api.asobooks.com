import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { IsEntityExist } from '../common/class-validators/entity-constraint.validator';

export class AssociationAddressUpdateRequestDto {
  @IsString()
  @IsOptional()
  address?: string;
  @IsString()
  @IsOptional()
  @IsEntityExist({
    column: 'code',
    isExist: true,
    name: 'country',

  }, {
    message: 'Country with code does not exist',
  })
  countryCode: string;
}
