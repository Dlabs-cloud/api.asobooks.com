import { PortalUser } from '../../domain/entity/portal-user.entity';
import { AssociationRepository } from '../../dao/association.repository';
import { GenericStatusConstant } from '../../domain/enums/generic-status-constant';
import { PortalUserAccountRepository } from '../../dao/portal-user-account.repository';
import { PortalAccountRepository } from '../../dao/portal-account.repository';
import { Injectable } from '@nestjs/common';
import { Connection } from 'typeorm';

@Injectable()
export class LoggedInUserInfoHandler {
  constructor(private readonly connection: Connection) {
  }

  async transform(portalUser: PortalUser) {
    let response = {
      firstName: portalUser.firstName,
      lastName: portalUser.lastName,
      username: portalUser.username,
      email: portalUser.email,
      phoneNumber: portalUser.phoneNumber,
    };
    let associations = await this.connection
      .getCustomRepository(AssociationRepository)
      .findByPortalUserAndStatus(portalUser, GenericStatusConstant.ACTIVE, GenericStatusConstant.PENDING_ACTIVATION);
    if (!associations.length) {
      return Promise.resolve(response);
    }
    let portalUserAccounts = await this
      .connection
      .getCustomRepository(PortalUserAccountRepository)
      .findByAssociationAndPortalUser(associations, portalUser);
    let portalAccountIds = portalUserAccounts.map(portalUserAccount => portalUserAccount.portalAccountId);
    let portalAccounts = await this
      .connection
      .getCustomRepository(PortalAccountRepository)
      .findById(GenericStatusConstant.ACTIVE, ...portalAccountIds);

    const transformedAssociations = associations.map(association => {
      let pAccounts = portalUserAccounts
        .filter(portalUserAccount => portalUserAccount.associationId = association.id)
        .map(associationPortalAccount => {
          return portalAccounts.find(portalAccount => portalAccount.id === associationPortalAccount.portalAccountId);
        })
        .map(pAccount => {
          return {
            accountCode: pAccount.accountCode,
            dateUpdated: pAccount.updatedAt,
            name: pAccount.name,
            type: pAccount.type,
          };
        });
      return {
        accounts: pAccounts,
        name: association.name,
        type: association.type,
        status: association.status,
        code: association.code,
      };
    });

    return {
      ...response,
      ...{
        association: transformedAssociations,
      },
    };
  }
}
