import { ServiceTypeConstant } from '../domain/enums/service-type.constant';
import { PaymentStatus } from '../domain/enums/payment-status.enum';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { IsDateFormat } from '../common/class-validators/date-format.validator';

export class BillSearchQueryDto {
  @IsOptional()
  @IsNumber()
  minAmount?: number;
  @IsOptional()
  @IsNumber()
  maxAmount?: number;
  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;
  @IsOptional()
  @IsNumber()
  limit?: number;
  @IsOptional()
  @IsNumber()
  offset?: number;
  @IsOptional()
  @IsEnum(ServiceTypeConstant)
  serviceType?: ServiceTypeConstant;
  @IsOptional()
  @IsDateFormat('DD/MM/YYYY', { message: 'Before date can only be in the format DD/MM/YYYY' })
  startDateBefore?: string;
  @IsOptional()
  @IsDateFormat('DD/MM/YYYY', { message: 'After date can only be in the format DD/MM/YYYY' })
  dateStartAfter?: string;
  @IsOptional()
  @IsString()
  name?: string;
  @IsOptional()
  @IsString()
  phonenumber?: string;
}