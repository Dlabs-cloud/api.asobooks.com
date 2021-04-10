import { Injectable } from '@nestjs/common';
import { Connection } from 'typeorm/connection/Connection';
import { MembershipInfo } from '../../domain/entity/association-member-info.entity';
import { PortalUserRepository } from '../../dao/portal-user.repository';
import { MembershipRoleRepository } from '../../dao/membership-role.repository';
import { PortalAccountTypeConstant } from '../../domain/enums/portal-account-type-constant';

@Injectable()
export class MembershipInfoHandler {
  constructor(private readonly connection: Connection) {
  }

  async transform(membershipInfos: MembershipInfo[], accountType?: PortalAccountTypeConstant) {
    if (!membershipInfos.length) {
      return Promise.resolve(null);
    }
    const portalUserIds = membershipInfos.map(membershipInfo => membershipInfo.portalUserId);
    const membershipRoles = await this.connection
      .getCustomRepository(MembershipRoleRepository)
      .findByMembershipInfo(membershipInfos, accountType);

    return this.connection
      .getCustomRepository(PortalUserRepository)
      .findByIds(portalUserIds)
      .then(portalUsers => {
        const users = membershipInfos.map(membershipInfo => {
          const userRoles = membershipRoles
            .filter(membershipRole => membershipRole.membership.membershipInfo.equals(membershipInfo))
            .map(membershipRole => {
              return membershipRole.role;
            });
          const portalUser = portalUsers.find(portalUser => portalUser.id === membershipInfo.portalUserId);
          return {
            email: portalUser.email,
            firstName: portalUser.firstName,
            lastName: portalUser.lastName,
            phoneNumber: portalUser.phoneNumber,
            username: portalUser.username,
            dateCreated: portalUser.createdAt,
            id: portalUser.id,
            identifier: membershipInfo.identifier,
            roles: userRoles,
          };
        });
        return Promise.resolve(users);
      });
  }
}
