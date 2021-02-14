import { ServiceFeeResponseDto } from './service-fee.response.dto';

export class ServiceFeeDetailResponseDto extends ServiceFeeResponseDto {
  billingStartDate: Date;
  nextBillingStartDate?: Date;
  nextBillingEndDate?: Date;
  dueDate?: Date;
  amountRaisedInMinorUnit?: number;
}