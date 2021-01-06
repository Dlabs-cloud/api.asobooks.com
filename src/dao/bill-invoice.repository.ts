import { BaseRepository } from '../common/BaseRepository';
import { BillInvoice } from '../domain/entity/bill-invoice.entity';
import { EntityRepository } from 'typeorm';
import { Invoice } from '../domain/entity/invoice.entity';

@EntityRepository(BillInvoice)
export class BillInvoiceRepository extends BaseRepository<BillInvoice> {
  findByInvoice(invoice: Invoice) {
    return this.findItem({
      invoice: invoice,
    });
  }
}
