import { PortalUser } from '../../domain/entity/portal-user.entity';
import { AssociationRepository } from '../../dao/association.repository';
import { GenericStatusConstant } from '../../domain/enums/generic-status-constant';
import { PortalAccountRepository } from '../../dao/portal-account.repository';
import { Injectable } from '@nestjs/common';
import { Connection } from 'typeorm';
import { PermissionRepository } from '../../dao/permission.repository';

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

    const portalAccounts = await this.connection
      .getCustomRepository(PortalAccountRepository)
      .findByAssociationsAndStatus(associations, GenericStatusConstant.ACTIVE, GenericStatusConstant.PENDING_ACTIVATION);
    const accountPermissions: { permissionid: number; portalaccountid: number }[] = await this.connection
      .getCustomRepository(PermissionRepository)
      .findByPortalUser(portalUser);

    const permissionId = accountPermissions.map(accountPermission => accountPermission.permissionid);


    const permissionModels = await this.connection
      .getCustomRepository(PermissionRepository)
      .findByIds(permissionId, { status: GenericStatusConstant.ACTIVE });

    const transformedAssociations = associations
      .map(association => {
        let associationAccounts = portalAccounts
          .map(portalAccount => {
            const permissions = accountPermissions
              .filter(accountPermission => accountPermission.portalaccountid === portalAccount.id)
              .map(accountPermission => {
                const permission = permissionModels
                  .find(permission => permission.id === accountPermission.permissionid);
                return {
                  name: permission.name,
                  code: permission.code,
                };
              });
            return {
              accountCode: portalAccount.code,
              dateUpdated: portalAccount.updatedAt,
              name: portalAccount.name,
              type: portalAccount.type,
              permissions: permissions,
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
        associations: transformedAssociations,
      },
    };
  }
}
