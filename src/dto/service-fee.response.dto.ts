import { ServiceFee } from '../domain/entity/service.fee.entity';
import { Column, ManyToOne } from 'typeorm';
import { ServiceTypeConstant } from '../domain/enums/service-type.constant';
import { Association } from '../domain/entity/association.entity';
import { BillingCycleConstant } from '../domain/enums/billing-cycle.constant';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';

export class ServiceFeeResponseDto {
  name: string;
  code: string;
  amountInMinorUnit: number;
  description: string;
  type: ServiceTypeConstant;
  cycle: BillingCycleConstant;
  billingStartDate: Date;
  nextBillingStartDate?: Date;
  nextBillingEndDate?: Date;
  dueDate?: Date;
  status: GenericStatusConstant;
}