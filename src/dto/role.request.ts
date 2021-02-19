import { ArrayNotEmpty, IsArray, IsNotEmpty, IsString } from 'class-validator';

export class RoleRequest {
  @IsNotEmpty()
  @IsString()
  name: string;
  @ArrayNotEmpty()
  @IsArray()
  permissions: string[];
}