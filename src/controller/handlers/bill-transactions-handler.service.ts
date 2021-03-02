import { Injectable } from '@nestjs/common';
import { Bill } from '../../domain/entity/bill.entity';
import { MembershipRepository } from '../../dao/membership.repository';
import { PaymentTransactionRepository } from '../../dao/payment-transaction.repository';
import { SubscriptionBillsResponseDto } from '../../dto/subscription-bills-response.dto';
import { Connection } from 'typeorm/connection/Connection';
import { PortalUserRepository } from '../../dao/portal-user.repository';

@Injectable()
export class BillTransactionsHandler {

  constructor(private readonly connection: Connection) {
  }

  transform(billTransactions: Map<Bill, number>) {
    let paymentTransactionIds = Array.from(billTransactions.values());
    paymentTransactionIds = paymentTransactionIds.filter(paymentTransactionId => !!paymentTransactionId);
    const bills = Array.from(billTransactions.keys());
    if (!bills || !bills.length) {
      return Promise.resolve(undefined);
    }
    const membershipIds = bills.map(bill => bill.membershipId);
    return this.connection
      .getCustomRepository(MembershipRepository)
      .findByIds(membershipIds)
      .then(memberships => {
        return this.connection.getCustomRepository(PortalUserRepository)
          .findByMemberships(memberships).then(portalUsers => {
            bills.forEach(bill => {
              bill.membership = memberships.find(membership => membership.id == bill.membershipId);
              bill.membership.portalUser = portalUsers.find(portalUser => portalUser.id === bill.membership.portalUserId);
            });
            return Promise.resolve(bills);
          }).then(async (bills) => {
            const paymentTransactions = await this.connection.getCustomRepository(PaymentTransactionRepository)
              .findByIds(paymentTransactionIds);
            const response: SubscriptionBillsResponseDto[] = [];
            billTransactions.forEach((value, bill) => {
              bill = bills.find(billValue => billValue.id === bill.id);
              const paymentTransaction = paymentTransactions.find(paymentTransaction => paymentTransaction.id === value);
              const res: SubscriptionBillsResponseDto = {
                email: bill.membership.portalUser.email,
                firstName: bill.membership.portalUser.firstName,
                lastName: bill.membership.portalUser.lastName,
                paymentDate: paymentTransaction?.confirmedPaymentDate,
                paymentStatus: bill.paymentStatus,
                phoneNumber: bill.membership.portalUser.phoneNumber,
                transactionReference: paymentTransaction?.reference,
              };
              response.push(res);
            });
            return Promise.resolve(response);
          });
      });

  }


}