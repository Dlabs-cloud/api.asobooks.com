import { PortalAccountTypeConstant } from '../domain/enums/portal-account-type-constant';
import { IsEnum, IsNumber, isNumber, IsOptional, isString, IsString } from 'class-validator';

export class PortalUserQueryDto {
  @IsString()
  @IsOptional()
  query: string;
  @IsEnum(PortalAccountTypeConstant)
  @IsOptional()
  type: PortalAccountTypeConstant;
  @IsOptional()
  @IsString()
  dateCreatedBefore: string;
  @IsOptional()
  @IsString()
  dateCreatedAfter: string;
  @IsOptional()
  @IsNumber()
  limit: number;
  @IsOptional()
  @IsNumber()
  offset: number;

}