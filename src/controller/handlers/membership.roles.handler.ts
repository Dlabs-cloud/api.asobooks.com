import { MembershipRole } from '../../domain/entity/membership-role.entity';
import { CollectionUtils } from '../../common/utils/collection-utils';
import { Injectable } from '@nestjs/common';
import { MembershipRoleDto } from '../../dto/membership-role.dto';

@Injectable()
export class MembershipRolesHandler {


  transform(roleMembership: MembershipRole[]) {
    const groupByPortalUsers = CollectionUtils.groupBy(roleMembership, (rm) => {
      return rm.membership.membershipInfo.portalUser.id;
    });
    const portalUserIds = Object.keys(groupByPortalUsers);
    return portalUserIds.map(portalUserId => {
      const membershipRoles = groupByPortalUsers[portalUserId] as MembershipRole[];
      const membershipRole = membershipRoles[0];
      const membershipInfo = membershipRole.membership.membershipInfo;
      const portalUser = membershipInfo.portalUser;
      const roles = membershipRoles.map(membershipRole => {
        return membershipRole.role;
      });
      const res: MembershipRoleDto = {
        email: portalUser.email,
        firstName: portalUser.firstName,
        identifier: membershipInfo.identifier,
        lastName: portalUser.lastName,
        roles: roles,
      };
      return res;
    });
  }
}
