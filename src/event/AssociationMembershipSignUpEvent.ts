import { PortalUser } from '../domain/entity/portal-user.entity';

export class AssociationMembershipSignUpEvent {
  constructor(public readonly portalUser: PortalUser) {
  }
}