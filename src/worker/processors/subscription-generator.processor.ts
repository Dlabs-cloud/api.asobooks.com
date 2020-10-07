import { Connection } from 'typeorm';
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { ServiceFeeRepository } from '../../dao/service-fee.repository';
import * as moment from 'moment';
import { SubscriptionRequestDto } from '../../dto/subscription.request.dto';
import { SubscriptionService } from '../../service/subscription.service';
import { ServiceTypeConstant } from '../../domain/enums/service-type.constant';
import { Queues } from '../../core/cron.enum';


@Processor(Queues.SUBSCRIPTION)
export class SubscriptionGeneratorProcessor {
  constructor(private readonly connection: Connection,
              private readonly subscriptionService: SubscriptionService) {
  }

  @Process()
  async transcode(job: Job<{ type: ServiceTypeConstant }>) {
    await this.generateSubscription(job.data.type);
  }


  private generateSubscription(serviceType: ServiceTypeConstant) {
    let startOfTheDay = moment().startOf('day').toDate();
    let endOfTheDay = moment().endOf('day').toDate();
    let description = '';

    return this.connection
      .getCustomRepository(ServiceFeeRepository)
      .findServiceFeeBetweenNextBillingDate(startOfTheDay, endOfTheDay, serviceType)
      .then(serviceFees => {
        let subscriptions = serviceFees.map(serviceFee => {

          if (ServiceTypeConstant.RE_OCCURRING === serviceType) {
            description = `Subscription for ${serviceFee.name} for ${serviceFee.nextBillingStartDate} to ${serviceFee.nextBillingEndDate}`;
          } else {
            description = `Subscription for  ${serviceFee.name}`;
          }
          return this.connection.transaction(tx => {
            let subscription: SubscriptionRequestDto = {
              description,
            };
            return this.subscriptionService.createSubscription(tx, serviceFee, subscription);
          });
        });
        return Promise.all(subscriptions);
      });
  }

}