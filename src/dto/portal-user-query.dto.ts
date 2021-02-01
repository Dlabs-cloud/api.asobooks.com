import { PortalAccountTypeConstant } from '../domain/enums/portal-account-type-constant';
import { IsEnum, IsNumber, isNumber, IsOptional, isString, IsString } from 'class-validator';
import { IsDateFormat } from '../common/class-validators/date-format.validator';

export class PortalUserQueryDto {
  @IsString()
  @IsOptional()
  query: string;
  @IsEnum(PortalAccountTypeConstant)
  @IsOptional()
  type: PortalAccountTypeConstant;
  @IsOptional()
  @IsString()
  @IsDateFormat('DD/MM/YYYY', { message: 'Date must be in the format DD/MM/YYYY' })
  dateCreatedBefore: string;
  @IsOptional()
  @IsString()
  @IsDateFormat('DD/MM/YYYY', { message: 'Date must be in the format DD/MM/YYYY' })
  dateCreatedAfter: string;
  @IsOptional()
  @IsNumber()
  limit: number;
  @IsOptional()
  @IsNumber()
  offset: number;

}