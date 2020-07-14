import { Inject, Injectable } from '@nestjs/common';
import { PortalUser } from '../domain/entity/portal-user.entity';
import { Connection } from 'typeorm';
import { EmailValidationService } from '../common/contracts/email-validation-service';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';
import { PortalAccountService } from './portal-account.service';
import { PortalAccountRepository } from '../dao/portal-account.repository';
import { MembershipRepository } from '../dao/membership.repository';
import { MembershipService } from './membership.service';

@Injectable()
export class UserManagementService {

  constructor(private readonly connection: Connection,
              private readonly portalAccountService: PortalAccountService,
              private readonly membershipRepository: MembershipRepository,
              private readonly membershipService: MembershipService,
              @Inject('EMAIL_VALIDATION_SERVICE') private emailValidationService: EmailValidationService<PortalUser>) {
  }

  public async validatePrincipalUser(callbackToken: string) {
    let portalUser = await this.emailValidationService.validateEmailCallBackToken(callbackToken);

    return this.connection.transaction(async entityManager => {
      portalUser.status = GenericStatusConstant.ACTIVE;
      portalUser.updatedAt = new Date();
      await entityManager.save(portalUser);
      let portalAccount = await entityManager
        .getCustomRepository(PortalAccountRepository)
        .findFirstByPortalUserAndStatus(portalUser, GenericStatusConstant.IN_ACTIVE);
      await this.portalAccountService.activatePortalAccount(entityManager, portalAccount);
      let membership = await entityManager
        .getCustomRepository(MembershipRepository)
        .findByPortalAccountAndPortalUser(portalUser, portalAccount, GenericStatusConstant.IN_ACTIVE);
      await this.membershipService.activateMembership(entityManager, membership);
      return portalUser;
    });
  }
}