import { BaseRepository } from '../common/BaseRepository';
import { PaymentRequest } from '../domain/entity/payment-request.entity';
import { EntityRepository, In } from 'typeorm';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';
import { PaymentStatus } from '../domain/enums/payment-status.enum';
import { PaymentTransaction } from '../domain/entity/payment-transaction.entity';
import { Bill } from '../domain/entity/bill.entity';
import { BillInvoice } from '../domain/entity/bill-invoice.entity';
import { Invoice } from '../domain/entity/invoice.entity';

@EntityRepository(PaymentRequest)
export class PaymentRequestRepository extends BaseRepository<PaymentRequest> {

  findByReferenceAndPaymentStatus(reference: string, paymentStatus: PaymentStatus) {
    return this.findOneItemByStatus({
      reference,
      paymentStatus,
    });
  }

  findByInvoices(invoices: Invoice[]) {
    return this.find({
      where: {
        invoice: In(invoices),
      },
    });
  }

  findByReference(reference: string, status = GenericStatusConstant.ACTIVE) {
    return this.findOne({
      reference, status,
    }, {
      relations: ['initiatedBy'],
    });

  }

  findByPaymentTransaction(paymentTransactions: PaymentTransaction[]) {
    const paymentRequestIds = paymentTransactions.map(paymentTransaction => paymentTransaction.paymentRequestId);
    return this.findByIds(paymentRequestIds);
  }

  findByBills(bills: Bill[]): Promise<PaymentRequest[]> {
    if (!bills || !bills.length) {
      return Promise.resolve(undefined);
    }
    const billIds = bills.map(bill => bill.id);
    return this.createQueryBuilder('paymentRequest')
      .innerJoin(BillInvoice, 'billInvoice', 'billInvoice.invoice = paymentRequest.invoice')
      .where('billInvoice.bill IN (:...billIds)', { billIds })
      .getMany();
  }
}
