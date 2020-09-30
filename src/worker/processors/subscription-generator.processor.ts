import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import { Connection } from 'typeorm';
import { Process, Processor } from '@nestjs/bull';
import { CronQueue } from '../../core/cron.enum';
import { Job } from 'bull';
import { ServiceFeeRepository } from '../../dao/service-fee.repository';
import * as moment from 'moment';
import { Subscription } from '../../domain/entity/subcription.entity';
import { SubscriptionCodeSequence } from '../../core/sequenceGenerators/subscription-code.sequence';
import { BillingCycleConstant } from '../../domain/enums/billing-cycle.constant';
import { IllegalArgumentException } from '../../exception/illegal-argument.exception';
import { SubscriptionRepository } from '../../dao/subscriptionRepository';

@Processor(CronQueue.SUBSCRIPTION)
export class SubscriptionGeneratorProcessor {
  constructor(private readonly connection: Connection,
              private readonly subscriptionCodeSequence: SubscriptionCodeSequence) {
  }

  @Process()
  async generate(data: Job<unknown>) {
    console.log('hey man');
    let startOfTheDay = moment().startOf('day').toDate();
    let endOfTheDay = moment().endOf('day').toDate();

    let subscriptions = this.connection
      .getCustomRepository(ServiceFeeRepository)
      .findServiceFeeBetweenNextBillingDate(startOfTheDay, endOfTheDay)
      .then(serviceFees => {
        console.log('length of the fees is ');
        console.log(serviceFees.length);
        let subscriptions = serviceFees.map(serviceFee => {
          return this.connection.transaction(tx => {
            return this.subscriptionCodeSequence.next().then(sequence => {
              let subscription = new Subscription();
              subscription.serviceFee = serviceFee;
              subscription.code = sequence;
              subscription.description = `Subscription for the period`;
              subscription.startDate = serviceFee.nextBillingDate;
              subscription.dueDate = serviceFee.dueDate;
              subscription.endDate = serviceFee.nextBillingDate;
              return tx.save(subscription)
                .then(subscription => {
                  serviceFee.nextBillingDate = this.calculateNextBillingDate(subscription.endDate, serviceFee.cycle);
                  return tx.save(serviceFee);
                });
            });
          });

        });

        return Promise.all(subscriptions);
      });


    await subscriptions;
  }


  private calculateNextBillingDate(date: Date, cycle: BillingCycleConstant) {
    switch (cycle) {
      case BillingCycleConstant.YEARLY:
        return moment(date)
          .startOf('day')
          .add(1, 'year')
          .toDate();
      case BillingCycleConstant.WEEKLY:
        return moment(date)
          .startOf('day')
          .add(1, 'week')
          .toDate();
      case BillingCycleConstant.QUARTERLY:
        return moment(date)
          .add(1, 'quarter')
          .toDate();
      case BillingCycleConstant.MONTHLY:
        return moment(date)
          .add(1, 'month')
          .startOf('day')
          .toDate();
      case BillingCycleConstant.BI_WEEKLY:
        return moment(date)
          .add(14, 'days')
          .startOf('day')
          .toDate();
      case BillingCycleConstant.DAILY:
        return moment(date)
          .add(1, 'day')
          .startOf('day')
          .toDate();
      default:
        throw new IllegalArgumentException('Type should be specified');

    }
  }

}