import { IsBoolean, IsEnum, IsNotEmpty, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';
import { AssociationTypeConstant } from '../../domain/enums/association-type-constant';
import { FileDto } from '../file.dto';
import { IsEntityExist } from '../../common/class-validators/entity-constraint.validator';
import { AssociationAddressRequestDto } from './association-address-request.dto';
import { BankInfoRequestDto } from '../user/bank-info-request.dto';
import { Type } from 'class-transformer';

export class AssociationRequestDto {
  @IsString()
  name?: string;
  @IsEnum(AssociationTypeConstant)
  type?: AssociationTypeConstant;
  @ValidateNested()
  @IsOptional()
  @IsObject()
  @Type(() => AssociationAddressRequestDto)
  address?: AssociationAddressRequestDto;
  @IsBoolean()
  activateAssociation?: boolean;
  @ValidateNested()
  @IsObject()
  @IsOptional()
  @Type(() => BankInfoRequestDto)
  bankInfo?: BankInfoRequestDto;
  logo?: FileDto;

}