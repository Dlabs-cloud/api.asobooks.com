import { Injectable, NotFoundException } from '@nestjs/common';
import { Membership } from '../domain/entity/membership.entity';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';
import { EntityManager } from 'typeorm';
import { MembershipDto } from '../dto/membership.dto';
import { MembershipCodeSequence } from '../core/sequenceGenerators/membership-code.sequence';
import { PortalUser } from '../domain/entity/portal-user.entity';
import { Association } from '../domain/entity/association.entity';
import { MembershipRepository } from '../dao/membership.repository';
import { IllegalArgumentException } from '../exception/illegal-argument.exception';

@Injectable()
export class MembershipService {

  constructor(private readonly membershipCodeSequence: MembershipCodeSequence) {
  }

  public activateMembership(entityManager: EntityManager, membership: Membership) {
    membership.status = GenericStatusConstant.ACTIVE;
    membership.updatedAt = new Date();
    return entityManager.save(membership);
  }

  public async createMembership(entityManager: EntityManager, membershipDto: MembershipDto, status = GenericStatusConstant.ACTIVE): Promise<Membership> {
    return this.membershipCodeSequence.next().then(sequenceCode => {
      const membership = new Membership();
      membership.portalUser = membershipDto.portalUser;
      membership.portalAccount = membershipDto.portalAccount;
      membership.status = status;
      membership.identificationNumber = sequenceCode;
      return entityManager.save(membership);
    });
  }


  public deactivateUserMemberships(entityManager: EntityManager, portalUser: PortalUser, association: Association) {
    return entityManager.getCustomRepository(MembershipRepository).findByUserAndAssociation(portalUser, association)
      .then(memberships => {
        if (!memberships.length) {
          throw new NotFoundException('Membership tied to user cannot be found');
        }
        const membershipPromise = memberships.map(membership => {
          membership.status = GenericStatusConstant.DELETED;
          return entityManager.save(membership);
        });
        return Promise.all(membershipPromise);
      });
  }
}