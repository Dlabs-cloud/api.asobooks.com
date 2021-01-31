import {
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  MIN,
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
  })
  email: string;
  @IsString()
  @IsOptional()
  phoneNumber: string;
  @ValidateNested()
  @IsOptional()
  @IsObject()
  @Type(() => AssociationAddressRequestDto)
  address?: AssociationAddressRequestDto;
  @IsEnum(PortalAccountTypeConstant, { each: true })
  types: PortalAccountTypeConstant[];
  @IsEntityExist({
    name: 'membership',
    column: 'identificationNumber',
    isExist: false,
  })
  identifier?: string;

}