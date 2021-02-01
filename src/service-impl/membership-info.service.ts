import { Injectable } from '@nestjs/common';
import { PortalUser } from '../domain/entity/portal-user.entity';
import { Association } from '../domain/entity/association.entity';
import { AddressDto } from '../dto/address.dto';
import { MembershipCodeSequence } from '../core/sequenceGenerators/membership-code.sequence';
import { MembershipInfo } from '../domain/entity/association-member-info.entity';
import { EntityManager } from 'typeorm';
import { Address } from '../domain/entity/address.entity';

@Injectable()
export class MembershipInfoService {
  constructor(private readonly membershipCodeSequence: MembershipCodeSequence) {
  }

  async createMembershipInfo(entityManager: EntityManager,
                             portalUser: PortalUser,
                             association: Association,
                             addressDTo?: AddressDto, identifier?: string) {

    const membershipInfo = new MembershipInfo();
    membershipInfo.portalUser = portalUser;
    if (addressDTo) {
      const address = new Address();
      address.unit = addressDTo.unit;
      address.country = addressDTo.country;
      address.name = addressDTo.name;
      await entityManager.save(address).then(address => {
        membershipInfo.address = address;
      });
    }

    membershipInfo.association = association;
    membershipInfo.identifier = identifier || await this.membershipCodeSequence.next();
    return entityManager.save(membershipInfo);
  }
}