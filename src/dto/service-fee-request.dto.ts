import { ServiceTypeConstant } from '../domain/enums/service-type.constant';
import { BillingCycleConstant } from '../domain/enums/billing-cycle.constant';
import {
  ArrayNotEmpty,
  IsArray, IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
} from 'class-validator';
import { IsValidDate } from '../common/class-validators/date.validator';
import { isEmpty } from '@nestjs/common/utils/shared.utils';

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
  cycle?: BillingCycleConstant;

  @IsNotEmpty()
  @IsValidDate({
    isBefore: false,
    format: 'DD/MM/YYYY',
  }, {
    message: 'startDate can only be in future or today with date format DD/MM/YYYY',
  })
  billingStartDate?: string;

  @IsOptional()
  @IsValidDate({
    isBefore: false,
    format: 'DD/MM/YYYY',
  }, {
    message: 'Due can only be in future or today with date format DD/MM/YYYY',
  })
  dueDate?: string;

  @IsOptional()
  @IsArray()
  recipients?: string[];

  @IsOptional()
  @IsBoolean()
  addAllMembers?: boolean;

}
