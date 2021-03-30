import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { IsDateFormat } from '../common/class-validators/date-format.validator';
import { PaymentType } from '../domain/enums/payment-type.enum';

export class WalletTransactionQueryDto {
  @IsNumber()
  @IsOptional()
  limit?: number;
  @IsNumber()
  @IsOptional()
  offset?: number;
  @IsNumber()
  @IsString()
  minAmountInMinorUnit?: number;
  @IsNumber()
  @IsString()
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
