import { Injectable } from '@nestjs/common';
import { Connection } from 'typeorm/connection/Connection';
import { MembershipInfo } from '../../domain/entity/association-member-info.entity';
import { PortalUserRepository } from '../../dao/portal-user.repository';

@Injectable()
export class MembershipInfoHandler {
  constructor(private readonly connection: Connection) {
  }

  transform(membershipInfos: MembershipInfo[]) {
    if (!membershipInfos.length) {
      return Promise.resolve(null);
    }
    const portalUserIds = membershipInfos.map(membershipInfo => membershipInfo.portalUserId);
    return this.connection
      .getCustomRepository(PortalUserRepository)
      .findByIds(portalUserIds)
      .then(portalUsers => {
        const users = membershipInfos.map(membershipInfo => {
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
          };
        });
        return Promise.resolve(users);
      });
  }
}