import { Injectable } from '@nestjs/common';
import { Connection } from 'typeorm/connection/Connection';
import { Subscription } from '../../domain/entity/subcription.entity';
import { SubscriptionSummaryResponseDto } from '../../dto/subscription-summary-response.dto';
import { BillRepository } from '../../dao/bill.repository';
import { PaymentStatus } from '../../domain/enums/payment-status.enum';
import { ServiceFee } from '../../domain/entity/service.fee.entity';

@Injectable()
export class SubscriptionHandler {


  constructor(private readonly connection: Connection) {
  }


  transform(serviceFee: ServiceFee, subscriptions: Subscription[]) {
    if (!subscriptions || !subscriptions.length) {
      return Promise.resolve(null);
    }
    const responses = subscriptions.map(subscription => {
      const response: SubscriptionSummaryResponseDto = new SubscriptionSummaryResponseDto();
      response.endDate = subscription.endDate;
      response.startDate = subscription.startDate;
      response.code = subscription.code;
      response.id = subscription.id;
      return response;
    });
    return this.connection.getCustomRepository(BillRepository)
      .countBySubscriptionsAndPaymentStatus(subscriptions, PaymentStatus.PAID)
      .then((countSubscriptionIds: { count, subscriptionId }[]) => {
        if (!countSubscriptionIds.length) {
          return Promise.resolve(null);
        }
        responses.forEach(subscription => {
          subscription.countNumberOfPaid = countSubscriptionIds
            .find(countSubscriptionId => {
              return countSubscriptionId.subscriptionId === subscription.id;
            }).count;
          subscription.amountReceivedInMinorUnit = serviceFee.amountInMinorUnit * subscription.countNumberOfPaid;
        });
        return Promise.resolve(null);
      }).then(() => {
        return this.connection.getCustomRepository(BillRepository)
          .countBySubscriptionsAndPaymentStatus(subscriptions, PaymentStatus.NOT_PAID)
          .then((countSubscriptionIds: { count, subscriptionId }[]) => {
            if (!countSubscriptionIds.length) {
              return Promise.resolve(null);
            }
            responses.forEach(subscription => {
              subscription.countNumberOfPaid = countSubscriptionIds
                .find(countSubscriptionId => countSubscriptionId.subscriptionId === subscription.id)
                .count;
              subscription.amountReceivedInMinorUnit = serviceFee.amountInMinorUnit * subscription.countNumberOfPaid;
            });
            return Promise.resolve(null);
          }).then(() => {
            return Promise.resolve(responses);
          });
      });


  }
}