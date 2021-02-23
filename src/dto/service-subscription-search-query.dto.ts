import { IsNumber, IsOptional } from 'class-validator';
import { IsDateFormat } from '../common/class-validators/date-format.validator';

export class ServiceSubscriptionSearchQueryDto {

  @IsOptional()
  @IsDateFormat('DD/MM/YYYY', { message: 'Start date can only be in the format DD/MM/YYYY' })
  startDate?: string;
  @IsOptional()
  @IsDateFormat('DD/MM/YYYY', { message: 'End date can only be in the format DD/MM/YYYY' })
  endDate?: string;
  @IsOptional()
  @IsNumber()
  limit?: number;
  @IsOptional()
  @IsNumber()
  offset?: number;
  @IsOptional()
  @IsNumber()
  amountReceivedInMinorUnitGreater?: number;
  @IsOptional()
  @IsNumber()
  amountReceivedInMinorUnitLess?: number;

  @IsOptional()
  @IsNumber()
  amountPendingInMinorUnitLess?: number;
  @IsOptional()
  @IsNumber()
  amountPendingInMinorUnitGreater?: number;


}