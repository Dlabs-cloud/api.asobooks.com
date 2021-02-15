import { Injectable } from '@nestjs/common';
import { Bill } from '../../domain/entity/bill.entity';
import { MembershipRepository } from '../../dao/membership.repository';
import { BillInvoiceRepository } from '../../dao/bill-invoice.repository';
import { PaymentRequestRepository } from '../../dao/payment-request.repository';
import { PaymentTransactionRepository } from '../../dao/payment-transaction.repository';
import { SubscriptionBillsResponseDto } from '../../dto/subscription-bills-response.dto';
import { Connection } from 'typeorm/connection/Connection';
import { Membership } from '../../domain/entity/membership.entity';
import { BillInvoice } from '../../domain/entity/bill-invoice.entity';
import { Invoice } from '../../domain/entity/invoice.entity';
import { PaymentTransaction } from '../../domain/entity/payment-transaction.entity';

@Injectable()
export class SubscriptionBillHandler {

  constructor(private readonly connection: Connection) {
  }

  transform(bills: Bill[]) {
    return this.connection
      .getCustomRepository(MembershipRepository)
      .findByBills(bills)
      .then(memberships => {
        return this.connection
          .getCustomRepository(BillInvoiceRepository)
          .findByBills(bills)
          .then(billInvoices => {
            const invoices = billInvoices.map(billInvoice => billInvoice.invoice);
            return this.connection
              .getCustomRepository(PaymentRequestRepository)
              .findByInvoices(invoices)
              .then(paymentRequests => {
                return this.connection
                  .getCustomRepository(PaymentTransactionRepository)
                  .findByPaymentRequests(paymentRequests)
                  .then(paymentTransactions => {
                    paymentTransactions.forEach(paymentTransaction => {
                      paymentTransaction.paymentRequest.invoice = invoices.find(invoice => invoice.id === paymentTransaction.paymentRequest.invoiceId);
                    });
                    return Promise.resolve(paymentTransactions);
                  });
              }).then(paymentTransactions => {
                return this.transformDto(bills, memberships, billInvoices, invoices, paymentTransactions);
              });
          });
      });
  }

  private transformDto(bills: Bill[], memberships: Membership[], billInvoices: BillInvoice[], invoices: Invoice[], paymentTransactions: PaymentTransaction[]) {
    return bills.map(bill => {
      const membership = memberships.find(membership => membership.id === bill.membershipId);
      const billInvoice = billInvoices.find(billInvoice => billInvoice.bill.id === bill.id);
      const invoice = invoices.find((invoice => invoice.id === billInvoice.invoice.id));
      const paymentTransaction = paymentTransactions.find(paymentTransaction => paymentTransaction.paymentRequest.invoice.id === invoice.id);
      const response: SubscriptionBillsResponseDto = {
        email: membership.portalUser.email,
        firstName: membership.portalUser.firstName,
        lastName: membership.portalUser.lastName,
        paymentDate: paymentTransaction?.confirmedPaymentDate,
        paymentStatus: bill.paymentStatus,
        phoneNumber: membership.portalUser.phoneNumber,
        transactionReference: paymentTransaction?.reference,
      };
      return response;
    });
  }
}