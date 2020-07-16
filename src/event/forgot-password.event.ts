import { PortalUser } from '../domain/entity/portal-user.entity';

export class ForgotPasswordEvent {

  constructor(public readonly portalUser: PortalUser) {
  }
}