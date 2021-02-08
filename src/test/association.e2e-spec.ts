import { INestApplication } from '@nestjs/common';
import { Connection } from 'typeorm/connection/Connection';
import { IEmailValidationService } from '../contracts/i-email-validation-service';
import { PortalUser } from '../domain/entity/portal-user.entity';
import { PortalAccount } from '../domain/entity/portal-account.entity';
import { TestingModule } from '@nestjs/testing';
import { baseTestingModule, generateToken } from './test-utils';
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

  //
  // it('Test that a created association can create its wallet', async () => {
  //   const
  //     let;
  //   assoc = await associationUpdate(loginToken);
  //   await associationService.createAssociation(assoc.payload, {
  //     association: assoc.association, portalUser: assoc.portalUser,
  //   });
  //   loginToken = assoc.loginToken;
  //   let payload = assoc.payload;
  //   payload.activateAssociation = 'true';
  //   let response = await request(applicationContext.getHttpServer())
  //     .put('/associations/onboard')
  //     .set('Authorization', loginToken);
  //
  //   const
  //
  //     console;
  // .
  //   log(response.body);
  //   // .send(payload).expect(201);
  //   await connection.getCustomRepository(WalletRepository).findByAssociation(assoc.association).then(wallet => {
  //     expect(wallet.reference).toBeDefined();
  //     expect(0).toEqual(Number(wallet.availableBalanceInMinorUnits));
  //
  //   });
  // });
  //
  //
  // it('Test that updating of association creates right records', async () => {
  //   const __ret = await associationUpdate(loginToken);
  //
  //   await associationService.createAssociation(__ret.payload, {
  //     association: __ret.association, portalUser: __ret.portalUser,
  //   });
  //   loginToken = __ret.loginToken;
  //   let payload = __ret.payload;
  //   payload.activateAssociation = 'false';
  //   let response = await request(applicationContext.getHttpServer())
  //     .put('/associations/onboard')
  //     .set('Authorization', loginToken)
  //     .send(payload).expect(201);
  //
  //   expect(response.body.data.address).toBeDefined();
  //   expect(response.body.data.type).toBeDefined();
  // });

  afterAll(async () => {
    await connection.close();
    await applicationContext.close();
  });
});
