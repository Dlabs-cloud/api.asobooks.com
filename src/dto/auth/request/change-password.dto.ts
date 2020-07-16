import { IsNotEmpty, IsString } from 'class-validator';

export class ChangePasswordDto {
  @IsString({
    message: 'password can only be string',
  })
  @IsNotEmpty({
    message: 'password must be provided',
  })
  password: string;
}