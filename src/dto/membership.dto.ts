import { PortalAccount } from '../domain/entity/portal-account.entity';
import { Association } from '../domain/entity/association.entity';
import { PortalUser } from '../domain/entity/portal-user.entity';

export class MembershipDto {
  portalAccount: PortalAccount;
  association: Association;
  portalUser: PortalUser;
}