import { BaseRepository } from '../common/BaseRepository';
import { Association } from '../domain/entity/association.entity';
import { Brackets, EntityRepository } from 'typeorm';
import { PortalAccount } from '../domain/entity/portal-account.entity';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';
import { Membership } from '../domain/entity/membership.entity';
import { PortalUser } from '../domain/entity/portal-user.entity';

@EntityRepository(Association)
export class AssociationRepository extends BaseRepository<Association> {

  findByPortalAccount(portalAccount: PortalAccount, status = GenericStatusConstant.ACTIVE) {
    return this.createQueryBuilder('association')
      .select()
      .innerJoin(Membership, 'membership', 'membership.association=association.id')
      .where('association.status = :status')
      .andWhere('membership.portalAccount=:portalAccountId')
      .setParameter('portalAccountId', portalAccount.id)
      .setParameter('status', status)
      .getOne();
  }


  findBymembership(membership: Membership, status = GenericStatusConstant.PENDING_ACTIVATION) {
    return this.createQueryBuilder('association')
      .select()
      .innerJoin(Membership, 'membership', 'membership.association=association.id')
      .andWhere('association.status = :status')
      .andWhere('membership.id=:portalAccountId')
      .setParameter('status', status)
      .setParameter('portalAccountId', membership.id)
      .getOne();
  }

  findByPortalUserAndStatus(portalUser: PortalUser, ...status: GenericStatusConstant[]) {
    return this.createQueryBuilder('association')
      .select()
      .innerJoin(Membership, 'membership', 'membership.association=association.id')
      .andWhere('membership.portalUser=:portalUser')
      .andWhere('association.status IN (:...status)')
      .setParameter('portalUser', portalUser.id)
      .setParameter('status', status)
      .distinct()
      .getMany();
  }

  findByPortalUserAndCodeAndStatus(portalUser: PortalUser, associationCode: string, status = GenericStatusConstant.ACTIVE) {
    return this.createQueryBuilder('association')
      .select()
      .innerJoin(Membership, 'membership', 'membership.association=association.id')
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