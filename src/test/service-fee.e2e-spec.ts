import { INestApplication } from '@nestjs/common';
import { Connection } from 'typeorm/connection/Connection';
import { TestingModule } from '@nestjs/testing';
import { baseTestingModule, generateToken, getAssociationUser, getTestUser } from './test-utils';
import { ValidatorTransformPipe } from '../conf/validator-transform.pipe';
import { getConnection } from 'typeorm';
import { ServiceFeeRequestDto } from '../dto/service-fee-request.dto';
import { BillingCycleConstant } from '../domain/enums/billing-cycle.constant';
import * as faker from 'faker';
import * as moment from 'moment';
import { now } from 'moment';
import { ServiceTypeConstant } from '../domain/enums/service-type.constant';
import * as request from 'supertest';
import { factory } from './factory';
import { Association } from '../domain/entity/association.entity';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';
import { ServiceFee } from '../domain/entity/service.fee.entity';
import { PortalUserRepository } from '../dao/portal-user.repository';
import { ServiceFeeRepository } from '../dao/service-fee.repository';
import { PortalAccountTypeConstant } from '../domain/enums/portal-account-type-constant';
import { Subscription } from '../domain/entity/subcription.entity';
import { Bill } from '../domain/entity/bill.entity';
import { PaymentStatus } from '../domain/enums/payment-status.enum';
import { ServiceFeeQueryDto } from '../dto/service-fee-query.dto';
import { BillInvoice } from '../domain/entity/bill-invoice.entity';
import { PaymentRequest } from '../domain/entity/payment-request.entity';
import { PaymentTransaction } from '../domain/entity/payment-transaction.entity';
import { BillQueryDto } from '../dto/bill-query.dto';

describe('Service fees set up test ', () => {
  let applicationContext: INestApplication;
  let connection: Connection;
  let association: Association;
  let assoUser;

  beforeAll(async () => {
    const moduleRef: TestingModule = await baseTestingModule().compile();
    applicationContext = moduleRef.createNestApplication();
    applicationContext.useGlobalPipes(new ValidatorTransformPipe());
    await applicationContext.init();

    connection = getConnection();
    association = await factory().upset(Association).use(association => {
      association.status = GenericStatusConstant.ACTIVE;
      return association;
    }).create();

    assoUser = await getAssociationUser(GenericStatusConstant.ACTIVE, null, association);
  });

  it('test that service fee can be created with recipients', async () => {

    let awaitAssoUsers = [0, 1, 2, 3].map(number => {
      return getAssociationUser(GenericStatusConstant.ACTIVE, null, association, PortalAccountTypeConstant.MEMBER_ACCOUNT);
    });

    let membershipIdentifiers = (await Promise.all(awaitAssoUsers)).map(assoUser => assoUser.user.membership.membershipInfo.identifier);


    let requestPayload: ServiceFeeRequestDto = {
      amountInMinorUnit: 10_000_00,
      cycle: BillingCycleConstant.MONTHLY,
      description: faker.random.words(10),
      billingStartDate: moment(now()).format('DD/MM/YYYY'),
      name: faker.random.words(2),
      type: faker.random.arrayElement(Object.values(ServiceTypeConstant)),
      recipients: membershipIdentifiers,
    };

    let response = await request(applicationContext.getHttpServer())
      .post('/service-fees')
      .set('Authorization', assoUser.token)
      .set('X-ASSOCIATION-IDENTIFIER', assoUser.association.code)
      .send(requestPayload);

    expect(response.status).toEqual(201);
    let serviceCode = response.body.data.code;
    let serviceFee = await connection.getCustomRepository(ServiceFeeRepository)
      .findByCodeAndAssociation(serviceCode, association);

    let portalUsersCount = await connection
      .getCustomRepository(PortalUserRepository)
      .countByServiceFeeAndStatus(serviceFee);

    expect(portalUsersCount).toEqual(4);


  });


  it('test that set up fee can be created', async () => {
    let requestPayload: ServiceFeeRequestDto = {
      amountInMinorUnit: 1000000,
      cycle: BillingCycleConstant.MONTHLY,
      description: faker.random.words(10),
      billingStartDate: moment(faker.date.future()).format('DD/MM/YYYY'),
      name: faker.random.words(2),
      type: faker.random.arrayElement(Object.values(ServiceTypeConstant)),
    };


    let response = await request(applicationContext.getHttpServer())
      .post('/service-fees')
      .set('Authorization', assoUser.token)
      .set('X-ASSOCIATION-IDENTIFIER', assoUser.association.code)
      .send(requestPayload);
    expect(response.status).toEqual(201);
    expect(response.body.data.code).toBeDefined();
  });

  it('test that a service fee can be gotten by code', async () => {
    let serviceFee = await factory().upset(ServiceFee).use((serviceFee) => {
      serviceFee.association = association;
      return serviceFee;
    }).create().then(serviceFee => {
      return factory().upset(Subscription).use(subscription => {
        subscription.serviceFee = serviceFee;
        return subscription;
      }).create().then(subscription => {
        return factory().upset(Bill).use(bill => {
          bill.paymentStatus = PaymentStatus.PAID;
          bill.subscription = subscription;
          return bill;
        }).create().then(() => {
          return serviceFee;
        });
      });
    });


    let response = await request(applicationContext.getHttpServer())
      .get(`/service-fees/${serviceFee.code}`)
      .set('Authorization', assoUser.token)
      .set('X-ASSOCIATION-IDENTIFIER', assoUser.association.code);
    expect(response.status).toEqual(200);
    let data = response.body.data;
    expect(data.name).toEqual(serviceFee.name);
    expect(data.code).toEqual(serviceFee.code);
    expect(data.amountInMinorUnit).toStrictEqual(serviceFee.amountInMinorUnit.toString());
    expect(data.description).toEqual(serviceFee.description);
    expect(data.billingStartDate).toBeDefined();
    expect(data.amountRaisedInMinorUnit).toEqual(+serviceFee.amountInMinorUnit);
  });


  it('test that a services subscriptions summary can be gotten by code', async () => {
    jest.setTimeout(9000);
    let serviceFee = await factory().upset(ServiceFee).use((serviceFee) => {
      serviceFee.association = association;
      return serviceFee;
    }).create();

    const subscriptions = await factory().upset(Subscription)
      .use(subscription => {
        subscription.serviceFee = serviceFee;
        return subscription;
      }).createMany(3);

    const billsPromise: Promise<Bill[]>[] = subscriptions.map(subscription => {
      return factory().upset(Bill).use(bill => {
        bill.subscription = subscription;
        bill.paymentStatus = PaymentStatus.PAID;
        bill.payableAmountInMinorUnit = 2000_00;
        bill.totalAmountPaidInMinorUnit = 2000_00;
        return bill;
      }).createMany(2);
    });
    await Promise.all(billsPromise);

    return request(applicationContext.getHttpServer())
      .get(`/service-fees/${serviceFee.code}/subscriptions?limit=2`)
      .set('Authorization', assoUser.token)
      .set('X-ASSOCIATION-IDENTIFIER', assoUser.association.code)
      .expect(200)
      .then(response => {
        const data = response.body.data;
        expect(data.total).toEqual(3);
        expect(data.offset).toEqual(0);
        expect(parseInt(data.itemsPerPage.toString())).toEqual(2);
        expect(data.items.length).toEqual(2);
      });
  });

  it('Test that user can search for services by query', () => {
    return getAssociationUser().then(testUser => {
      return factory().upset(ServiceFee).use(fee => {
        fee.association = testUser.association;
        fee.billingStartDate = new Date();
        return fee;
      }).create().then((fee) => {
        const createdAtDate = moment(fee.createdAt).format('DD/MM/YYYY');
        const billingStartDate = moment(fee.billingStartDate).format('DD/MM/YYYY');
        const queryParam: ServiceFeeQueryDto = {
          dateCreatedAfter: createdAtDate,
          dateCreatedBefore: createdAtDate,
          frequency: fee.cycle,
          limit: 1,
          offset: 0,
          startDateAfter: billingStartDate,
          startDateBefore: billingStartDate,
          type: fee.type,
          status: GenericStatusConstant.ACTIVE,
          name: fee.name,
          minAmount: fee.amountInMinorUnit,
          maxAmount: fee.amountInMinorUnit,
        };
        const queryParams = Object.keys(queryParam).map(key => {
          return `${key}=${queryParam[key]}`;
        });
        const query = queryParams.join('&');
        const url = `/service-fees?${query}`;
        return request(applicationContext.getHttpServer())
          .get(url)
          .set('Authorization', testUser.token)
          .set('X-ASSOCIATION-IDENTIFIER', testUser.association.code)
          .expect(200)
          .then(response => {
            const data = response.body.data;
            expect(data.total).toEqual(1);
            expect(data.offset).toEqual(0);
            expect(+data.itemsPerPage).toEqual(1);
            expect(data.items[0]).toBeDefined();
          });
      });
    });
  });

  it('Test that service fee can be removed', () => {
    return getAssociationUser().then(testUser => {
      return factory().upset(ServiceFee).use(serviceFee => {
        serviceFee.association = testUser.association;
        return serviceFee;
      }).create().then((serviceFee) => {
        const url = `/service-fees/${serviceFee.code}`;
        return request(applicationContext.getHttpServer())
          .delete(url)
          .set('Authorization', testUser.token)
          .set('X-ASSOCIATION-IDENTIFIER', testUser.association.code)
          .expect(204)
          .then(() => {
            return connection.getCustomRepository(ServiceFeeRepository)
              .findOne({ code: serviceFee.code }).then(serviceFee => {
                expect(serviceFee).toBeDefined();
              });
          });
      });
    });
  });

  it('Test that bills of a service Fee can be gotten by query', () => {
    return getTestUser(GenericStatusConstant.ACTIVE, null, null, PortalAccountTypeConstant.MEMBER_ACCOUNT)
      .then(testUser => {
        return factory().upset(ServiceFee).use(serviceFee => {
          serviceFee.type = ServiceTypeConstant.ONE_TIME;
          serviceFee.association = testUser.association;
          return serviceFee;
        }).create().then(serviceFee => {
          return factory().upset(Subscription).use(subscription => {
            subscription.serviceFee = serviceFee;
            return subscription;
          }).create().then(_ => {
            return factory().upset(Bill).use(bill => {
              bill.membership = testUser.membership;
              bill.paymentStatus = PaymentStatus.PAID;
              bill.subscription = _;
              return bill;
            }).create().then(bill => {
              return factory().upset(BillInvoice).use(billInvoice => {
                billInvoice.bill = bill;
                return billInvoice;
              }).create().then(billInvoice => {
                const invoice = billInvoice.invoice;
                invoice.paymentStatus = PaymentStatus.PAID;
                invoice.association = testUser.association;
                return invoice.save();
              }).then(invoice => {
                return factory().upset(PaymentRequest).use(paymentRequest => {
                  paymentRequest.invoice = invoice;
                  paymentRequest.association = testUser.association;
                  return paymentRequest;
                }).create().then(paymentRequest => {
                  return factory().upset(PaymentTransaction).use(paymentTransaction => {
                    paymentTransaction.paymentRequest = paymentRequest;
                    paymentTransaction.confirmedPaymentDate = new Date();
                    return paymentTransaction;
                  }).create().then(paymentTransaction => {
                    const date = moment(bill.createdAt).format('DD/MM/YYYY');
                    const queryParam: BillQueryDto = {
                      limit: 1,
                      name: bill.membership.portalUser.firstName,
                      offset: 0,
                      feeType: serviceFee.type,
                      paymentStatus: bill.paymentStatus,
                      phoneNumber: bill.membership.portalUser.phoneNumber,
                      receiptNumber: paymentTransaction.reference,
                      createdDateAfter: date,
                      createdDateBefore: date,
                      timeOfPaymentAfter: date,
                      timeOfPaymentBefore: date,
                    };
                    const queryParams = Object.keys(queryParam).map(key => {
                      return `${key}=${queryParam[key]}`;
                    });
                    const query = queryParams.join('&');
                    const url = `/service-fees/${serviceFee.code}/bills?${query}`;
                    return generateToken(testUser.membership).then(token => {

                      return request(applicationContext.getHttpServer())
                        .get(url)
                        .set('Authorization', token)
                        .set('X-ASSOCIATION-IDENTIFIER', testUser.association.code)
                        .expect(200).then(respnse => {
                          const body = respnse.body.data;
                          const item = body.items[0];
                          const portalUser = bill.membership.portalUser;
                          expect(item.email).toEqual(portalUser.email);
                          expect(item.firstName).toEqual(portalUser.firstName);
                          expect(item.lastName).toEqual(portalUser.lastName);
                          expect(new Date(item.paymentDate)).toEqual(new Date(paymentTransaction.confirmedPaymentDate));
                          expect(item.paymentStatus).toEqual(bill.paymentStatus);
                          expect(item.phoneNumber).toEqual(portalUser.phoneNumber);
                          expect(item.transactionReference).toEqual(paymentTransaction.reference);
                          expect(body.itemsPerPage).toEqual(1);
                          expect(body.total).toEqual(1);
                        });
                    });

                  });
                });
              });
            });
          });
        });
      });
  });

  afterAll(async () => {
    await connection.close();
    await applicationContext.close();
  });
});