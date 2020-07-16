import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class PasswordResetDto {
  @IsString({
    message: 'email must be string and valid',
  })
  @IsNotEmpty({
    message: 'email must be provided',
  })
  @IsEmail()
  email: string;

}