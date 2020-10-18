import { INestApplication } from '@nestjs/common';
import { Connection } from 'typeorm/connection/Connection';
import { TestingModule } from '@nestjs/testing';
import { baseTestingModule } from './test-utils';
import { ValidatorTransformPipe } from '../conf/validator-transform.pipe';
import { getConnection } from 'typeorm';
import { WorkerModule } from '../worker/worker.module';
import { ServiceModule } from '../service/service.module';
import { ServiceFeeService } from '../service/service-fee.service';
import { factory } from './factory';
import { ServiceFee } from '../domain/entity/service.fee.entity';
import { BillGeneratorProcessor } from '../worker/processors/bill-generator.processor';
import { Association } from '../domain/entity/association.entity';
import { Group } from '../domain/entity/group.entity';
import { GroupMembership } from '../domain/entity/group-membership.entity';
import { GroupServiceFee } from '../domain/entity/group-sevice-fee.entity';
import { Subscription } from '../domain/entity/subcription.entity';
import { BillRepository } from '../dao/bill.repository';


describe('Subscription-generator-processor  ', () => {
  let applicationContext: INestApplication;
  let connection: Connection;
  let billGeneratorProcessor: BillGeneratorProcessor;
  let serviceFeeService: ServiceFeeService;


  beforeAll(async () => {

    const moduleRef: TestingModule = await baseTestingModule().compile();
    applicationContext = moduleRef.createNestApplication();
    applicationContext.useGlobalPipes(new ValidatorTransformPipe());
    await applicationContext.init();

    connection = getConnection();
    billGeneratorProcessor = applicationContext
      .select(WorkerModule)
      .get(BillGeneratorProcessor, { strict: true });
    serviceFeeService = applicationContext
      .select(ServiceModule)
      .get(ServiceFeeService, { strict: true });


  });


  it('That that a bill can can be created for members for a subscription', async () => {
    let association = await factory().upset(Association).create();
    let groups = await factory().upset(Group).use(group => {
      group.association = association;
      return group;
    }).createMany(2);
    let groupMemberships = groups.map(group => {
      return factory().upset(GroupMembership)
        .use(groupMembership => {
          groupMembership.group = group;
          return groupMembership;
        }).createMany(2);
    });
    await Promise.all(groupMemberships);
    let serviceFees = await factory()
      .upset(ServiceFee)
      .use(serviceFee => {
        serviceFee.association = association;
        serviceFee.amountInMinorUnit = 10_000_00;
        return serviceFee;
      }).createMany(2);


    for (let i = 0; i < 2; i++) {
      await factory().upset(GroupServiceFee)
        .use(groupServiceFee => {
          groupServiceFee.group = groups[i];
          groupServiceFee.serviceFee = serviceFees[i];
          return groupServiceFee;
        }).create();
    }

    let subscriptionPromise = serviceFees.map(serviceFee => {
      return factory().upset(Subscription).use(subcription => {
        subcription.serviceFee = serviceFee;
        return subcription;
      }).create();
    });
    let subscriptions = await Promise.all(subscriptionPromise);

    await billGeneratorProcessor.handler();

    for (let i = 0; i < 2; i++) {
      let subscription = subscriptions[i];
      let bills = await connection
        .getCustomRepository(BillRepository)
        .findBySubscriptionAndStatus(subscription);
      expect(bills.length).toEqual(2);
    }


  });

  afterAll(async () => {
    await connection.close();
    await applicationContext.close();
  });
});