import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { ServiceFee } from '../domain/entity/service.fee.entity';
import { SubscriptionRequestDto } from '../dto/subscription.request.dto';
import { Subscription } from '../domain/entity/subcription.entity';
import { SubscriptionCodeSequence } from '../core/sequenceGenerators/subscription-code.sequence';
import { ServiceTypeConstant } from '../domain/enums/service-type.constant';
import { ServiceFeeService } from './service-fee.service';

@Injectable()
export class SubscriptionService {

  constructor(private readonly subscriptionCodeSequence: SubscriptionCodeSequence,
              private readonly serviceFeeService: ServiceFeeService) {
  }


  public async createSubscription(entityManager: EntityManager, serviceFee: ServiceFee, subscription: SubscriptionRequestDto) {
    let sub = new Subscription();
    sub.serviceFee = serviceFee;
    sub.description = subscription.description;
    sub.code = await this.subscriptionCodeSequence.next();
    sub.serviceType = serviceFee.type;

    if (ServiceTypeConstant.RE_OCCURRING === serviceFee.type) {

      sub.startDate = serviceFee.nextBillingStartDate;
      sub.endDate = serviceFee.nextBillingEndDate;

      return entityManager.save(sub).then(subscription => {
        serviceFee.nextBillingStartDate = sub.endDate;
        serviceFee.nextBillingEndDate = this.serviceFeeService
          .calculateNextBillingDate(sub.endDate, serviceFee.cycle);
        return entityManager
          .save(serviceFee)
          .then(serviceFee => {
            return subscription;
          });
      });
    }
    sub.startDate = serviceFee.billingStartDate;
    sub.dueDate = serviceFee.dueDate;
    return entityManager.save(sub);
  }

}