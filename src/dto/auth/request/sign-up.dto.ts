import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

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