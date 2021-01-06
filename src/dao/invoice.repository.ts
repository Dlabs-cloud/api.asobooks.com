import { BaseRepository } from '../common/BaseRepository';
import { Invoice } from '../domain/entity/invoice.entity';
import { EntityRepository } from 'typeorm';
import { Membership } from '../domain/entity/membership.entity';
import { PaymentStatus } from '../domain/enums/payment-status.enum';

@EntityRepository(Invoice)
export class InvoiceRepository extends BaseRepository<Invoice> {
  findByCodeAndCreatedBy(code: string, createdBy: Membership) {
    return this.findOneItemByStatus({
      code: code,
      createdBy: createdBy,
    });
  }

  findByCodeAndPaymentStatus(reference: string, paymentStatus: PaymentStatus) {
    return this.findOneItemByStatus({
      code: reference,
      paymentStatus: paymentStatus,
    });
  }
}