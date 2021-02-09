import { ServiceTypeConstant } from '../domain/enums/service-type.constant';
import { PaymentStatus } from '../domain/enums/payment-status.enum';

export class BillSearchQueryDto {
  minAmount?: number;
  maxAmount?: number;
  paymentStatus: PaymentStatus;
  limit?: number;
  offset?: number;
  serviceType: ServiceTypeConstant;
}