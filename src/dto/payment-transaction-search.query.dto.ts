import { IsDateFormat } from '../common/class-validators/date-format.validator';

export class PaymentTransactionSearchQueryDto {
  limit?: number;
  offset?: number;
  minAmountInMinorUnit?: number;
  maxAmountInMinorUnit?: number;
  @IsDateFormat('DD/MM/YYYY')
  dateCreatedBefore?: number;
  @IsDateFormat('DD/MM/YYYY')
  dateCreatedAfter?: number;
}