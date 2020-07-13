import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { PortalUser } from '../domain/entity/portal-user.entity';
import { AuthenticationUtils } from '../common/utils/authentication-utils.service';

@Injectable()
export class PortalUserService {
  constructor(private authenticationUtils: AuthenticationUtils) {
  }

  async createPortalUser(entityManager: EntityManager, portalUser: PortalUser) {
    portalUser.password = await this.authenticationUtils.hashPassword(portalUser.password);
    //await entityManager.save(portalUser);
    return portalUser;
  }
}