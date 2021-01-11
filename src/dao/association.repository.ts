import { BaseRepository } from '../common/BaseRepository';
import { Association } from '../domain/entity/association.entity';
import { EntityRepository } from 'typeorm';
import { PortalAccount } from '../domain/entity/portal-account.entity';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';
import { PortalUser } from '../domain/entity/portal-user.entity';
import { Membership } from '../domain/entity/membership.entity';

@EntityRepository(Association)
export class AssociationRepository extends BaseRepository<Association> {

  findByPortalAccount(portalAccount: PortalAccount, status = GenericStatusConstant.ACTIVE) {
    return this.createQueryBuilder('association')
      .select()
      .innerJoin(PortalAccount, 'portalAccount', 'portalAccount.association=association.id')
      .where('association.status = :status')
      .andWhere('portalAccount.id = :portalAccountId')
      .setParameter('portalAccountId', portalAccount.id)
      .setParameter('status', status)
      .getOne();
  }


  findByMembership(membership: Membership, status = GenericStatusConstant.PENDING_ACTIVATION) {
    return this.createQueryBuilder('association')
      .select()
      .innerJoin(PortalAccount, 'portalAccount', 'portalAccount.association=association.id')
      .innerJoin(Membership, 'membership', 'membership.portalAccount=portalAccount.id')
      .andWhere('association.status = :status')
      .andWhere('membership.id=:membershipId')
      .setParameter('status', status)
      .setParameter('membershipId', membership.id)
      .getOne();
  }

  findByPortalUserAndStatus(portalUser: PortalUser, ...status: GenericStatusConstant[]) {
    return this.createQueryBuilder('association')
      .select()
      .innerJoin(PortalAccount, 'portalAccount', 'portalAccount.association=association.id')
      .innerJoin(Membership, 'membership', 'membership.portalAccount = portalAccount.id')
      .andWhere('membership.portalUser=:portalUser')
      .andWhere('association.status IN (:...statuses)')
      .setParameter('portalUser', portalUser.id)
      .setParameter('statuses', status)
      .distinct()
      .getMany();

  }

  findByPortalUserAndCodeAndStatus(portalUser: PortalUser, associationCode: string, status = GenericStatusConstant.ACTIVE) {
    return this.createQueryBuilder('association')
      .select()
      .innerJoin(PortalAccount, 'portalAccount', 'portalAccount.association=association.id')
      .innerJoin(Membership, 'membership', 'membership.portalAccount=portalAccount.id')
      .andWhere('association.status = :status')
      .andWhere('membership.portalUser=:portalUser')
      .andWhere('association.code = :associationCode')
      .setParameter('status', status)
      .setParameter('portalUser', portalUser.id)
      .setParameter('associationCode', associationCode)
      .distinct()
      .getOne();

  }


}