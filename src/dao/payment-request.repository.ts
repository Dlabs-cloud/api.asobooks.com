import { BaseRepository } from '../common/BaseRepository';
import { PaymentRequest } from '../domain/entity/payment-request.entity';
import { EntityRepository } from 'typeorm';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';
import { PaymentStatus } from '../domain/enums/payment-status.enum';

@EntityRepository(PaymentRequest)
export class PaymentRequestRepository extends BaseRepository<PaymentRequest> {

  findByReferenceAndPaymentStatus(reference: string, paymentStatus: PaymentStatus) {
    return this.findOneItemByStatus({
      reference,
      paymentStatus,
    });
  }

  findByReference(reference: string, status = GenericStatusConstant.ACTIVE) {
    return this.findOneItemByStatus({
      reference,
      status,
    });

  }
}
