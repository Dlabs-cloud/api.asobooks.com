import { ServiceTypeConstant } from '../domain/enums/service-type.constant';
import { BillingCycleConstant } from '../domain/enums/billing-cycle.constant';
import { IsArray, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min, ValidateIf } from 'class-validator';
import { IsDateFormat } from '../common/class-validators/date.validator';

export class ServiceFeeRequestDto {

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsInt()
  @Min(0)
  amountInMinorUnit: number;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(ServiceTypeConstant)
  @IsNotEmpty()
  type: ServiceTypeConstant;

  @IsEnum(BillingCycleConstant)
  @ValidateIf(o => o.type === ServiceTypeConstant.RE_OCCURRING, {
    message: 'Billing cycle must be provided if the type is RE_OCCURRING',
  })
  cycle: BillingCycleConstant;

  @IsNotEmpty()
  @IsDateFormat({
    isBefore: false,
    format: 'DD/MM/YYYY',
  }, {
    message: 'firstBillingDate can only be in future!!',
  })
  firstBillingDate?: string;
  @IsOptional()
  @IsArray()
  recipients?: string[];

}