import { PortalUser } from '../domain/entity/portal-user.entity';
import { PortalAccount } from '../domain/entity/portal-account.entity';

export interface TokenPayloadDto {
  portalUser: PortalUser
  portalAccount?: PortalAccount,
}