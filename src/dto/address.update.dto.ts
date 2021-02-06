import { IsOptional, isString, IsString } from 'class-validator';

export class AddressUpdateDto {
  @IsOptional()
  @IsString()
  address: string;

  @IsOptional()
  @IsString()
  unit: string;

  @IsOptional()
  @IsString()
  countryCode: string;
}