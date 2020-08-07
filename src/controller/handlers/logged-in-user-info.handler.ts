import { PortalUser } from '../../domain/entity/portal-user.entity';
import { AssociationRepository } from '../../dao/association.repository';
import { GenericStatusConstant } from '../../domain/enums/generic-status-constant';
import { MembershipRepository } from '../../dao/membership.repository';
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
    let portalAccounts = await this.connection
      .getCustomRepository(PortalAccountRepository)
      .findByStatusAndAssociation(GenericStatusConstant.ACTIVE, associations);
    const transformedAssociations = associations
      .map(association => {

        let associationAccounts = portalAccounts
          .filter(portalAccount => portalAccount.associationId == association.id)
          .map(portalAccount => {
            return {
              accountCode: portalAccount.code,
              dateUpdated: portalAccount.updatedAt,
              name: portalAccount.name,
              type: portalAccount.type,
            };
          });

        return {
          accounts: associationAccounts,
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
