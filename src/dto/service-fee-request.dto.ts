import { ServiceTypeConstant } from '../domain/enums/service-type.constant';
import { BillingCycleConstant } from '../domain/enums/billing-cycle.constant';
import { IsEnum, IsInt, IsNotEmpty, IsString, Min } from 'class-validator';
import { IsDateFormat } from '../common/class-validators/date.validator';

export class ServiceFeeRequestDto {

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsInt()
  @Min(0)
  amountInMinorUnit: number;

  @IsString()
  description: string;

  @IsEnum(ServiceTypeConstant)
  @IsNotEmpty()
  type: ServiceTypeConstant;

  @IsEnum(BillingCycleConstant)
  @IsNotEmpty()
  cycle: BillingCycleConstant;

  @IsNotEmpty()
  @IsDateFormat({
    isBefore: false,
    format: 'DD/MM/YYYY',
  }, {
    message: 'firstBillingDate can only be in future!!'
  })
  firstBillingDate?: string;

}