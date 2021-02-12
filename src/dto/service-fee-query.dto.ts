import { BillingCycleConstant } from '../domain/enums/billing-cycle.constant';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { IsDateFormat } from '../common/class-validators/date-format.validator';
import { ServiceTypeConstant } from '../domain/enums/service-type.constant';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';

export class ServiceFeeQueryDto {
  @IsOptional()
  @IsNumber()
  limit?: number;
  @IsOptional()
  @IsNumber()
  offset?: number;
  @IsOptional()
  @IsEnum(BillingCycleConstant)
  frequency?: BillingCycleConstant;
  @IsOptional()
  @IsEnum(ServiceTypeConstant)
  type?: ServiceTypeConstant;
  @IsOptional()
  @IsEnum(GenericStatusConstant)
  status?: GenericStatusConstant;
  @IsOptional()
  @IsString()
  @IsDateFormat('DD/MM/YYYY', { message: 'Date must be in the format DD/MM/YYYY' })
  dateCreatedAfter?: string;
  @IsOptional()
  @IsString()
  @IsDateFormat('DD/MM/YYYY', { message: 'Date must be in the format DD/MM/YYYY' })
  dateCreatedBefore?: string;
  @IsOptional()
  @IsString()
  @IsDateFormat('DD/MM/YYYY', { message: 'Date must be in the format DD/MM/YYYY' })
  startDateBefore?: string;
  @IsOptional()
  @IsString()
  @IsDateFormat('DD/MM/YYYY', { message: 'Date must be in the format DD/MM/YYYY' })
  startDateAfter?: string;
}