import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  MIN, MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AssociationAddressRequestDto } from '../association/association-address-request.dto';
import { PortalAccountTypeConstant } from '../../domain/enums/portal-account-type-constant';
import { IsEntityExist } from '../../common/class-validators/entity-constraint.validator';
import { GenericStatusConstant } from '../../domain/enums/generic-status-constant';
import { Membership } from '../../domain/entity/membership.entity';

export class MemberSignUpDto {
  @IsNotEmpty()
  @IsString()
  firstName: string;
  @IsNotEmpty()
  @IsString()
  lastName: string;
  @IsString()
  @IsEmail()
  @IsEntityExist({
    column: 'email',
    isExist: false,
    name: 'portal_user',
  }, { message: 'Email already exist' })
  email: string;
  @IsString()
  @IsOptional()
  phoneNumber: string;
  @ValidateNested()
  @IsOptional()
  @IsObject()
  @Type(() => AssociationAddressRequestDto)
  address?: AssociationAddressRequestDto;
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one account type must be provided' })
  @IsEnum(PortalAccountTypeConstant, { each: true })
  types: PortalAccountTypeConstant[];
  @IsEntityExist({
    name: 'membership_info',
    column: 'identifier',
    isExist: false,
  }, { message: 'Identifier has already been used' })
  identifier?: string;

}