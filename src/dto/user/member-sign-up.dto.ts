import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class MemberSignUpDto {
  @IsNotEmpty()
  @IsString()
  firstName: string;
  @IsString()
  @IsEmail()
  email: string;
  phoneNumber: string;
}