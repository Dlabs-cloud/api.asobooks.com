import { PortalUser } from '../domain/entity/portal-user.entity';
import { PortalAccount } from '../domain/entity/portal-account.entity';

export class NewAccountSignUpEvent {

  constructor(public readonly portalAccount: PortalAccount) {
  }
}