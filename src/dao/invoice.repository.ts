import { BaseRepository } from '../common/BaseRepository';
import { Invoice } from '../domain/entity/invoice.entity';
import { EntityRepository } from 'typeorm';
import { Membership } from '../domain/entity/membership.entity';
import { PaymentStatus } from '../domain/enums/payment-status.enum';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';

@EntityRepository(Invoice)
export class InvoiceRepository extends BaseRepository<Invoice> {
  findByCodeAndCreatedBy(code: string, createdBy: Membership) {
    return this.findOne({
      code: code,
      createdBy: createdBy,
      status: GenericStatusConstant.ACTIVE,
    }, {
      relations: [
        'createdBy',
      ],
    });
  }

  findByCodeAndPaymentStatus(reference: string, paymentStatus: PaymentStatus) {
    return this.findOneItemByStatus({
      code: reference,
      paymentStatus: paymentStatus,
    });
  }
}
