import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MIN_LENGTH, MinLength } from 'class-validator';
import { AssociationTypeConstant } from '../../../domain/enums/association-type-constant';

export class SignUpDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;
  @IsString()
  @IsNotEmpty()
  lastName: string;
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;
  @IsString()
  @IsOptional()
  phoneNumber?: string;
  @IsString()
  @IsNotEmpty()
  associationName: string;
  @IsString()
  @IsNotEmpty()
  @MinLength(6, {
    'message': 'Password can only be minimum of six',
  })
  password: string;
}