import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { IsDateFormat } from '../common/class-validators/date-format.validator';
import { PaymentStatus } from '../domain/enums/payment-status.enum';
import { ServiceFee } from '../domain/entity/service.fee.entity';
import { ServiceTypeConstant } from '../domain/enums/service-type.constant';

export class BillQueryDto {
  @IsOptional()
  @IsDateFormat('DD/MM/YYYY', { message: 'Start date can only be in the format DD/MM/YYYY' })
  createdDateAfter?: string;
  @IsOptional()
  @IsDateFormat('DD/MM/YYYY', { message: 'End date can only be in the format DD/MM/YYYY' })
  createdDateBefore?: string;
  @IsOptional()
  @IsString()
  name?: string;
  @IsOptional()
  @IsString()
  phoneNumber?: string;
  @IsOptional()
  @IsDateFormat('DD/MM/YYYY', { message: 'Time of payment before can only be in the format DD/MM/YYYY' })
  timeOfPaymentBefore?: string;
  @IsOptional()
  @IsDateFormat('DD/MM/YYYY', { message: 'Time of payment after can only be in the format DD/MM/YYYY' })
  timeOfPaymentAfter?: string;
  @IsOptional()
  @IsString()
  receiptNumber?: string;
  @IsOptional()
  @IsNumber()
  limit?: number;
  @IsOptional()
  @IsNumber()
  offset?: number;
  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;
  @IsOptional()
  @IsEnum(ServiceTypeConstant)
  feeType?: ServiceTypeConstant;


}