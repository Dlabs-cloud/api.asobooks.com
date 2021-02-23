import { Injectable } from '@nestjs/common';
import { Connection } from 'typeorm/connection/Connection';
import { Subscription } from '../../domain/entity/subcription.entity';
import { SubscriptionSummaryResponseDto } from '../../dto/subscription-summary-response.dto';
import { BillRepository } from '../../dao/bill.repository';
import { PaymentStatus } from '../../domain/enums/payment-status.enum';
import { ServiceFee } from '../../domain/entity/service.fee.entity';
import { GenericStatusConstant } from '../../domain/enums/generic-status-constant';

@Injectable()
export class SubscriptionHandler {


  constructor(private readonly connection: Connection) {
  }


  transform(serviceFee: ServiceFee, subscriptions: Subscription[]) {
    if (!subscriptions || !subscriptions.length) {
      return Promise.resolve(null);
    }

    return this.connection
      .getCustomRepository(BillRepository)
      .findBySubscriptions(subscriptions, GenericStatusConstant.ACTIVE)
      .then(bills => {
        return subscriptions.map(subscription => {
          const subscriptionBills = bills.filter(bill => bill.subscriptionId === subscription.id);
          const numberOfPaidBills = subscriptionBills
            .filter(bill => bill.paymentStatus === PaymentStatus.PAID)
            .length;
          const numberOfPendingBills = subscriptionBills.length - +numberOfPaidBills;
          const response: SubscriptionSummaryResponseDto = new SubscriptionSummaryResponseDto();
          response.endDate = subscription.endDate;
          response.startDate = subscription.startDate;
          response.code = subscription.code;
          response.id = subscription.id;
          response.name = subscription.description;
          response.countNumberOfPending = +numberOfPendingBills;
          response.countNumberOfPaid = +numberOfPaidBills;
          response.amountPendingInMinorUnit = serviceFee.amountInMinorUnit * +numberOfPendingBills;
          response.amountReceivedInMinorUnit = serviceFee.amountInMinorUnit * +numberOfPaidBills;
          return response;
        });
      });


  }
}