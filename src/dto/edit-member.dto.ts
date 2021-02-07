import { PortalAccountTypeConstant } from '../domain/enums/portal-account-type-constant';
import { ArrayMinSize, IsArray, IsEnum, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';
import { AddressDto } from './address.dto';
import { AddressUpdateDto } from './address.update.dto';
import { Type } from 'class-transformer';
import { AssociationAddressRequestDto } from './association/association-address-request.dto';

export class EditMemberDto {
  @IsOptional()
  @IsString()
  firstName: string;
  @IsOptional()
  @IsString()
  lastName: string;
  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => AddressUpdateDto)
  address: AddressUpdateDto;
  @IsOptional()
  @IsString()
  phoneNumber: string;
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one account type must be provided during update' })
  @IsEnum(PortalAccountTypeConstant, { each: true })
  types: PortalAccountTypeConstant[];

}