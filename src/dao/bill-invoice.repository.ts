import { BaseRepository } from '../common/BaseRepository';
import { BillInvoice } from '../domain/entity/bill-invoice.entity';
import { EntityRepository, In } from 'typeorm';
import { Invoice } from '../domain/entity/invoice.entity';
import { Bill } from '../domain/entity/bill.entity';

@EntityRepository(BillInvoice)
export class BillInvoiceRepository extends BaseRepository<BillInvoice> {
  findByInvoice(invoice: Invoice) {
    return this.findItem({
      invoice: invoice,
    });
  }

  findByBills(bills: Bill[]) {
    return this.find({
      loadEagerRelations: true,
      where: {
        bill: In(bills),
      },
    });
  }
}
