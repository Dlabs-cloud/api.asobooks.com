import { INestApplication } from '@nestjs/common';
import { Connection } from 'typeorm/connection/Connection';
import { SubscriptionGeneratorProcessor } from '../worker/processors/subscription-generator.processor';
import { ServiceFeeService } from '../service-impl/service-fee.service';
import { TestingModule } from '@nestjs/testing';
import { baseTestingModule } from './test-utils';
import { ValidatorTransformPipe } from '../conf/validator-transform.pipe';
import { getConnection } from 'typeorm';
import { WorkerModule } from '../worker/worker.module';
import { ServiceImplModule } from '../service-impl/serviceImplModule';
import { factory } from './factory';
import { ServiceFee } from '../domain/entity/service.fee.entity';
import * as moment from 'moment';
import { ServiceTypeConstant } from '../domain/enums/service-type.constant';
import { SubscriptionRepository } from '../dao/subscription.repository';
import { BillingCycleConstant } from '../domain/enums/billing-cycle.constant';

describe('Bill-generator-processor  ', () => {
  let applicationContext: INestApplication;
  let connection: Connection;
  let subscriptionGeneratorProcessor: SubscriptionGeneratorProcessor;
  let serviceFeeService: ServiceFeeService;


  beforeAll(async () => {

    const moduleRef: TestingModule = await baseTestingModule().compile();
    applicationContext = moduleRef.createNestApplication();
    applicationContext.useGlobalPipes(new ValidatorTransformPipe());
    await applicationContext.init();

    connection = getConnection();
    subscriptionGeneratorProcessor = applicationContext
      .select(WorkerModule)
      .get(SubscriptionGeneratorProcessor, { strict: true });
    serviceFeeService = applicationContext
      .select(ServiceImplModule)
      .get(ServiceFeeService, { strict: true });


  });


  it('Test that subscriptions are only generated for that same day', async () => {
    let serviceFee = await factory().upset(ServiceFee).use(serviceFee => {
      serviceFee.billingStartDate = moment().add(4, 'days').toDate();
      serviceFee.type = ServiceTypeConstant.ONE_TIME;
      serviceFee.amountInMinorUnit = 10_000_00;
      return serviceFee;
    }).create();


    await subscriptionGeneratorProcessor.generateSubscription(ServiceTypeConstant.ONE_TIME);
    let subscriptions = await connection.getCustomRepository(SubscriptionRepository).findByServiceFee(serviceFee);
    expect(subscriptions.length).toEqual(0);
  });


  it('test that a reOccurring subscriptions can be created from a service-impl fee', async () => {
    let serviceFee = await factory().upset(ServiceFee).use(serviceFee => {
      serviceFee.billingStartDate = new Date();
      serviceFee.type = ServiceTypeConstant.RE_OCCURRING;
      serviceFee.nextBillingEndDate = new Date();
      serviceFee.amountInMinorUnit = 10_000_00;
      serviceFee.cycle = BillingCycleConstant.MONTHLY;
      return serviceFee;
    }).create();


    await subscriptionGeneratorProcessor.generateSubscription(ServiceTypeConstant.RE_OCCURRING);
    let subscriptions = await connection.getCustomRepository(SubscriptionRepository).findByServiceFee(serviceFee);
    expect(subscriptions.length).toEqual(1);
    let subscription = subscriptions[0];
    expect(subscription.serviceFeeId).toEqual(serviceFee.id);
    expect(subscription.serviceType).toEqual(ServiceTypeConstant.RE_OCCURRING);
    expect(subscription.startDate).toEqual(serviceFee.nextBillingStartDate);

  });

  it('Test that a one time subscription can be created from a service-impl fee', async () => {

    let serviceFee = await factory().upset(ServiceFee).use(serviceFee => {
      serviceFee.billingStartDate = new Date();
      serviceFee.type = ServiceTypeConstant.ONE_TIME;
      serviceFee.amountInMinorUnit = 10_000_00;
      return serviceFee;
    }).create();


    await subscriptionGeneratorProcessor.generateSubscription(ServiceTypeConstant.ONE_TIME);
    let subscriptions = await connection.getCustomRepository(SubscriptionRepository).findByServiceFee(serviceFee);
    expect(subscriptions.length).toEqual(1);
    let subscription = subscriptions[0];
    expect(subscription.serviceFeeId).toEqual(serviceFee.id);
    expect(subscription.serviceType).toEqual(ServiceTypeConstant.ONE_TIME);
    expect(subscription.startDate).toEqual(serviceFee.billingStartDate);
    expect(subscription.dueDate).toEqual(serviceFee.dueDate);
    expect(subscription.serviceType).toEqual(serviceFee.type);
  });


  afterAll(async () => {
    await connection.close();
    await applicationContext.close();
  });
});