import { IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';

export class ProfileUpdateDto {
  @IsOptional()
  @IsString()
  firstName?: string;
  @IsOptional()
  @IsString()
  lastName?: string;
  @IsOptional()
  @IsString()
  password?: string;
  @IsOptional()
  @IsString()
  newPassword?: string;
}
