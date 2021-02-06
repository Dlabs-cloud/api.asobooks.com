import { Injectable } from '@nestjs/common';
import { PaymentTransaction } from '../../domain/entity/payment-transaction.entity';
import { Connection } from 'typeorm/connection/Connection';
import { PaymentTransactionsDto } from '../../dto/payment-transactions.dto';
import { MembershipRepository } from '../../dao/membership.repository';
import { PaymentRequestRepository } from '../../dao/payment-request.repository';
import { PaymentTransactionRepository } from '../../dao/payment-transaction.repository';
import { InvoiceRepository } from '../../dao/invoice.repository';
import { PortalUserRepository } from '../../dao/portal-user.repository';
import { connectableObservableDescriptor } from 'rxjs/internal/observable/ConnectableObservable';
import { dtsDtsxOrDtsDtsxMapRegex } from 'ts-loader/dist/constants';
import { MembershipInfoRepository } from '../../dao/membership-info.repository';
import { Association } from '../../domain/entity/association.entity';
import { PortalAccountRepository } from '../../dao/portal-account.repository';

@Injectable()
export class PaymentTransactionHandler {

  constructor(private readonly connection: Connection) {
  }

  async transform(paymentTransactions: PaymentTransaction[], association: Association) {
    if (!paymentTransactions.length) {
      return Promise.resolve([]);
    }
    const paymentRequests = await this.connection.getCustomRepository(PaymentRequestRepository).findByPaymentTransaction(paymentTransactions);
    const invoices = paymentRequests.map(paymentRequest => paymentRequest.invoice);
    const membershipIds = invoices.map(invoice => invoice.createdById);

    const memberships = await this.connection.getCustomRepository(MembershipRepository).findByIds(membershipIds);

    const portalUsers = await this.connection.getCustomRepository(PortalUserRepository).findByMemberships(memberships);
    const membershipInfos = await this.connection.getCustomRepository(MembershipInfoRepository).findByMemberships(memberships);
    return paymentTransactions.map(paymentTransaction => {
      const paymentRequest = paymentRequests.find(paymentRequest => paymentRequest.id === paymentTransaction.paymentRequestId);

      const invoice = invoices.find(invoice => invoice.id === paymentRequest.invoiceId);
      const membership = memberships.find(membership => membership.id === invoice.createdById);
      const portalUser = portalUsers.find(portalUser => portalUser.id === membership.portalUserId);
      const membershipInfo = membershipInfos.find(membershipInfo => membershipInfo.portalUserId === portalUser.id);
      const data: PaymentTransactionsDto = {
        paidByFirstName: portalUser.firstName,
        paidByLastLastName: portalUser.lastName,
        amountInMinorUnit: paymentTransaction.amountInMinorUnit,
        membershipReference: membershipInfo.identifier,
        paymentDate: paymentTransaction.datePaid,
        transactionReference: paymentTransaction.reference,
      };
      return data;
    });
  }
}