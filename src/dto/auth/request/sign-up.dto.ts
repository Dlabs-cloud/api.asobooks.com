import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

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
  @IsNotEmpty()
  phoneNumber: string;
  @IsString()
    // Todo Add Validation (Two active account with same name should not exist
  associationName: string;
  @IsString()
  @IsNotEmpty()
  password: string;
}