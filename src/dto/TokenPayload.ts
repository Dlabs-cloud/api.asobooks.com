import { PortalUser } from '../domain/entity/portal-user.entity';
import { PortalAccount } from '../domain/entity/portal-account.entity';

export interface TokenPayload {
  portalUser: PortalUser,
  portalAccount?: PortalAccount,
}