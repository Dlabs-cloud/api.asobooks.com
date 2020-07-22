import { Injectable } from '@nestjs/common';
import { Connection, EntityManager } from 'typeorm';
import { PortalUser } from '../domain/entity/portal-user.entity';
import { AuthenticationUtils } from '../common/utils/authentication-utils.service';
import { PortalUserRepository } from '../dao/portal-user.repository';
import { IllegalArgumentException } from '../exception/illegal-argument.exception';

@Injectable()
export class PortalUserService {
  constructor(private authenticationUtils: AuthenticationUtils,
              private readonly connection: Connection) {
  }

  async createPortalUser(entityManager: EntityManager, portalUser: PortalUser) {
    const existingIngPortalUser = await this.connection.getCustomRepository(PortalUserRepository)
      .findByUserNameOrEmailOrPhoneNumberAndNotDeleted(portalUser.email);

    if (existingIngPortalUser) {
      throw new IllegalArgumentException('portal user with email or user name is already existing');
    }
    portalUser.password = await this.authenticationUtils.hashPassword(portalUser.password);
    await entityManager.save(portalUser);
    return portalUser;
  }
}