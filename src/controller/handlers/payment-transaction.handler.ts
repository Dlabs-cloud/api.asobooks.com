import { Injectable } from '@nestjs/common';
import { PaymentTransaction } from '../../domain/entity/payment-transaction.entity';
import { PaymentTransactionsDto } from '../../dto/payment-transactions.dto';
import { PaymentType } from '../../domain/enums/payment-type.enum';
import { Connection } from 'typeorm/connection/Connection';

@Injectable()
export class PaymentTransactionHandler {


  async transform(paymentTransactions: PaymentTransaction[]) {
    if (!paymentTransactions.length) {
      return Promise.resolve([]);
    }
    return paymentTransactions.map(paymentTransaction => {
      const paymentRequest = paymentTransaction.paymentRequest;
      const membership = ((paymentRequest.paymentType === PaymentType.CREDIT) || (paymentRequest.paymentType === PaymentType.WALLET_REVERSAL))
        ? paymentRequest?.invoice?.createdBy
        : paymentRequest?.walletWithdrawal?.initiatedBy;
      const portalUser = membership.portalUser;
      const data: PaymentTransactionsDto = {
        paidByFirstName: portalUser.firstName,
        paidByLastLastName: portalUser.lastName,
        amountInMinorUnit: paymentTransaction.amountInMinorUnit,
        membershipReference: membership?.membershipInfo?.identifier,
        paymentDate: paymentTransaction.datePaid,
        paymentType: paymentRequest.paymentType,
        transactionReference: paymentTransaction.reference,
      };
      return data;
    });
  }
}
