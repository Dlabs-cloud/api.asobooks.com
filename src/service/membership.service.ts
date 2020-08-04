import { Injectable } from '@nestjs/common';
import { Membership } from '../domain/entity/membership.entity';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';
import { EntityManager } from 'typeorm';
import { MembershipDto } from '../dto/membership.dto';
import { MembershipCodeSequence } from '../core/sequenceGenerators/membership-code.sequence';

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
      membership.association = membershipDto.association;
      membership.code = sequenceCode;
      return entityManager.save(membership);
    });

  }
}