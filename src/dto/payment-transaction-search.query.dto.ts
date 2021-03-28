import { IsDateFormat } from '../common/class-validators/date-format.validator';
import { PaymentType } from '../domain/enums/payment-type.enum';
import { IsEnum, IsOptional } from 'class-validator';

export class PaymentTransactionSearchQueryDto {
  limit?: number;
  offset?: number;
  minAmountInMinorUnit?: number;
  maxAmountInMinorUnit?: number;
  @IsDateFormat('DD/MM/YYYY')
  dateCreatedBefore?: number;
  @IsDateFormat('DD/MM/YYYY')
  dateCreatedAfter?: number;
  @IsOptional()
  @IsEnum(PaymentType)
  type?: PaymentType;
  @IsOptional()
  membershipIdentifier?: string;
}
