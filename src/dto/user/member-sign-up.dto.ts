import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AssociationAddressRequestDto } from '../association/association-address-request.dto';
import { PortalAccountTypeConstant } from '../../domain/enums/portal-account-type-constant';

export class MemberSignUpDto {
  @IsNotEmpty()
  @IsString()
  firstName: string;
  @IsNotEmpty()
  @IsString()
  lastName: string;
  @IsString()
  @IsEmail()
  email: string;
  @IsString()
  @IsOptional()
  phoneNumber: string;
  @ValidateNested()
  @IsOptional()
  @IsObject()
  @Type(() => AssociationAddressRequestDto)
  address?: AssociationAddressRequestDto;
  @IsEnum(PortalAccountTypeConstant)
  @IsNotEmpty()
  type: PortalAccountTypeConstant;

}