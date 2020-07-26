import { IsBoolean, IsEnum, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { AssociationTypeConstant } from '../../domain/enums/association-type-constant';
import { FileDto } from '../file.dto';
import { IsEntityExist } from '../../common/class-validators/entity-constraint.validator';
import { AssociationAddressRequestDto } from './association-address-request.dto';
import { BankInfoRequestDto } from '../user/bank-info-request.dto';

export class AssociationRequestDto {
  @IsString()
  name?: string;
  @IsEnum(AssociationTypeConstant)
  type?: AssociationTypeConstant;
  @ValidateNested()
  address?: AssociationAddressRequestDto;
  @IsBoolean()
  activateAssociation?: boolean;
  @ValidateNested()
  bankInfo?: BankInfoRequestDto;
  logo?: FileDto;

}