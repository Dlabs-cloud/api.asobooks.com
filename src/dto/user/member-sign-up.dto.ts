import { IsBoolean, IsEmail, IsNotEmpty, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AssociationAddressRequestDto } from '../association/association-address-request.dto';

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

}