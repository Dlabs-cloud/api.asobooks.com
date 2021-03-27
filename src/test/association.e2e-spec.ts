import { INestApplication } from '@nestjs/common';
import { Connection } from 'typeorm/connection/Connection';
import { IEmailValidationService } from '../contracts/i-email-validation-service';
import { PortalUser } from '../domain/entity/portal-user.entity';
import { PortalAccount } from '../domain/entity/portal-account.entity';
import { TestingModule } from '@nestjs/testing';
import { baseTestingModule, generateToken, getAssociationUser } from './test-utils';
import { getConnection } from 'typeorm';
import { TokenPayloadDto } from '../dto/token-payload.dto';
import * as request from 'supertest';
import { AssociationRequestDto } from '../dto/association/association-request.dto';
import * as faker from 'faker';
import { factory } from './factory';
import { Country } from '../domain/entity/country.entity';
import { AssociationTypeConstant } from '../domain/enums/association-type-constant';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';
import { ValidatorTransformPipe } from '../conf/validator-transform.pipe';
import { Bank } from '../domain/entity/bank.entity';
import { ServiceModule } from '../service/service.module';
import { PortalAccountTypeConstant } from '../domain/enums/portal-account-type-constant';
import { Association } from '../domain/entity/association.entity';
import { Membership } from '../domain/entity/membership.entity';
import { AssociationRepository } from '../dao/association.repository';
import { WalletRepository } from '../dao/wallet.repository';
import { GroupRepository } from '../dao/group.repository';
import { GroupTypeConstant } from '../domain/enums/group-type.constant';
import { PortalAccountRepository } from '../dao/portal-account.repository';
import { UpdateAssociationDto } from '../dto/update-association.dto';
import { Wallet } from '../domain/entity/wallet.entity';
import { AddressRepository } from '../dao/address.repository';

async function generateAssociationRequestToken() {
  const payload: AssociationRequestDto = {
    address: {
      address: faker.address.secondaryAddress(),
      countryCode: (await factory().create(Country)).code,
      unit: faker.random.word(),
    },
    bankInfo: {
      code: (await factory().create(Bank)).code,
      accountNumber: faker.random.alphaNumeric(),
    },
    name: faker.random.word() + ' Association',
    type: faker.random.arrayElement(Object.values(AssociationTypeConstant)),

  };

  const association = await factory().upset(Association).use(association => {
    association.type = payload.type;
    association.status = GenericStatusConstant.PENDING_ACTIVATION;
    return association;
  }).create();
  const portalAccount = await factory().upset(PortalAccount).use(portalAccount => {
    portalAccount.type = PortalAccountTypeConstant.EXECUTIVE_ACCOUNT;
    portalAccount.association = association;
    return portalAccount;
  }).create();
  const membership = await factory().upset(Membership).use(membership => {
    membership.portalAccount = portalAccount;
    return membership;
  }).create();
  const token = await generateToken(membership);
  return { payload, token };
}

describe('AssociationController', () => {
  let applicationContext: INestApplication;
  let connection: Connection;
  let emailValidationService: IEmailValidationService<PortalUser, PortalAccount, TokenPayloadDto>;

  beforeAll(async () => {
    const moduleRef: TestingModule = await baseTestingModule().compile();
    applicationContext = moduleRef.createNestApplication();
    applicationContext.useGlobalPipes(new ValidatorTransformPipe());
    await applicationContext.init();

    connection = getConnection();
    emailValidationService = applicationContext.select(ServiceModule).get('EMAIL_VALIDATION_SERVICE', { strict: true });

  });


  it('Test that association can be created', async () => {
    const { payload, token } = await generateAssociationRequestToken();
    await request(applicationContext.getHttpServer())
      .put('/associations/onboard')
      .set('Authorization', token)
      .send(payload)
      .expect(201);
  });

  it('Test that compulsory items are created when association is created', async () => {
    const { payload, token } = await generateAssociationRequestToken();
    const response = await request(applicationContext.getHttpServer())
      .put('/associations/onboard')
      .set('Authorization', token)
      .send(payload)
      .then(response => {
        const data = response.body.data;
        return connection.getCustomRepository(AssociationRepository)
          .findById(GenericStatusConstant.ACTIVE, data.id)
          .then(associations => {
            const association = associations[0];
            return connection.getCustomRepository(WalletRepository)
              .findByAssociation(association)
              .then(wallet => {
                expect(wallet).toBeDefined();
              }).then(() => {
                return connection
                  .getCustomRepository(GroupRepository)
                  .findByAssociation(association, GroupTypeConstant.GENERAL)
                  .then(group => {
                    expect(group).toBeDefined();
                  }).then(() => {
                    return connection
                      .getCustomRepository(PortalAccountRepository)
                      .findItem({ association: association })
                      .then(portalAccounts => {
                        expect(portalAccounts.length).toEqual(2);
                      });
                  });
              });
          });
      });
  });


  it('Get Association detail', () => {
    return factory().create(Association).then(association => {
      return factory().upset(Wallet).use(wallet => {
        wallet.association = association;
        return wallet;
      }).create().then(_ => {
        return getAssociationUser(GenericStatusConstant.ACTIVE, null, association)
          .then(testUser => {
            return request(applicationContext.getHttpServer())
              .get('/associations')
              .set('Authorization', testUser.token)
              .set('X-ASSOCIATION-IDENTIFIER', testUser.association.code)
              .expect(200)
              .then(response => {
                const data = response.body.data;
                expect(data.name).toBeDefined();
                expect(data.type).toBeDefined();
                expect(data.account.name).toBeDefined();
                expect(data.account.number).toBeDefined();
                expect(data.bank).toBeDefined();
                expect(data.address).toBeDefined();
              });
          });
      });
    });
  });

  it('Test that an association can be updated', async () => {
    const countryCode = (await factory().create(Country)).code;
    const code = (await factory().create(Bank)).code;
    const payload: UpdateAssociationDto = {
      name: faker.random.alphaNumeric(),
      address: {
        address: faker.address.secondaryAddress(),
        countryCode: countryCode,
      },
      type: AssociationTypeConstant.HOUSING,
      bankInfo: {
        code: code,
        accountNumber: faker.finance.account(),
      },
    };
    return getAssociationUser().then(testUser => {
      return factory().upset(Wallet).use(wallet => {
        wallet.association = testUser.association;
        return wallet;
      }).create().then(_ => {
        return request(applicationContext.getHttpServer())
          .patch('/associations')
          .set('Authorization', testUser.token)
          .set('X-ASSOCIATION-IDENTIFIER', testUser.association.code)
          .send(payload)
          .then(response => {
            return connection
              .getCustomRepository(AssociationRepository)
              .findOne({ id: testUser.association.id })
              .then(association => {
                expect(association.name).toEqual(payload.name);
                expect(association.type).toEqual(payload.type);
                return connection
                  .getCustomRepository(AddressRepository)
                  .findOne({ id: association.addressId })
                  .then(address => {
                    expect(address.name).toEqual(payload.address.address);
                    expect(address.country.code).toEqual(payload.address.countryCode);
                  }).then(bankInfo => {
                    return connection
                      .getCustomRepository(WalletRepository)
                      .findOne({ association: association })
                      .then(wallet => {
                        expect(wallet.bank.accountNumber).toEqual(payload.bankInfo.accountNumber);
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
