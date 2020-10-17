import { INestApplication } from '@nestjs/common';
import { Connection } from 'typeorm/connection/Connection';
import { TestingModule } from '@nestjs/testing';
import { baseTestingModule } from './test-utils';
import { ValidatorTransformPipe } from '../conf/validator-transform.pipe';
import { getConnection } from 'typeorm';
import { SubscriptionGeneratorProcessor } from '../worker/processors/subscription-generator.processor';
import { WorkerModule } from '../worker/worker.module';
import { ServiceTypeConstant } from '../domain/enums/service-type.constant';
import { ServiceModule } from '../service/service.module';
import { ServiceFeeService } from '../service/service-fee.service';
import { factory } from './factory';
import { ServiceFee } from '../domain/entity/service.fee.entity';
import { SubscriptionRepository } from '../dao/subscription.repository';
import * as moment from 'moment';


describe('Subscription-generator-processor  ', () => {
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
      .select(ServiceModule)
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

  it('Test that a one time subscription can be created from a service fee', async () => {

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
  });


  afterAll(async () => {
    await connection.close();
    await applicationContext.close();
  });
});