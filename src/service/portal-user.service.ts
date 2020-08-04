import { Injectable } from '@nestjs/common';
import { Connection, EntityManager } from 'typeorm';
import { PortalUser } from '../domain/entity/portal-user.entity';
import { AuthenticationUtils } from '../common/utils/authentication-utils.service';
import { PortalUserRepository } from '../dao/portal-user.repository';
import { IllegalArgumentException } from '../exception/illegal-argument.exception';
import { PortalUserDto } from '../dto/portal-user.dto';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';

@Injectable()
export class PortalUserService {
  constructor(private authenticationUtils: AuthenticationUtils,
              private readonly connection: Connection) {
  }

  async createPortalUser(entityManager: EntityManager, portalUserDto: PortalUserDto, status = GenericStatusConstant.ACTIVE) {


    const existingIngPortalUser = await this.connection.getCustomRepository(PortalUserRepository)
      .findByUserNameOrEmailOrPhoneNumberAndNotDeleted(portalUserDto.email);

    if (existingIngPortalUser) {
      throw new IllegalArgumentException('portal user with email or user name is already existing');
    }

    return this.authenticationUtils.hashPassword(portalUserDto.password)
      .then(hashedPassword => {
        const portalUser = new PortalUser();
        portalUser.firstName = portalUserDto.firstName;
        portalUser.lastName = portalUserDto.lastName;
        portalUser.password = portalUserDto.password;
        portalUser.email = portalUserDto.email;
        portalUser.phoneNumber = portalUserDto.phoneNumber;
        portalUser.status = status;
        portalUser.password = hashedPassword;
        portalUser.username = portalUserDto.email;
        portalUser.email = portalUser.email.toLowerCase();
        return entityManager.save(portalUser);
      });


  }
}