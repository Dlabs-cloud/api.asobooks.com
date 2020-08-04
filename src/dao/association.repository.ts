import { BaseRepository } from '../common/BaseRepository';
import { Association } from '../domain/entity/association.entity';
import { Brackets, EntityRepository } from 'typeorm';
import { PortalAccount } from '../domain/entity/portal-account.entity';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';
import { PortalUser } from '../domain/entity/portal-user.entity';
import { Membership } from '../domain/entity/membership.entity';

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
    let selectQueryBuilder = this.createQueryBuilder('association')
      .select()
      .innerJoin(Membership, 'membership', 'membership.association=association.id')
      .andWhere('membership.portalUser=:portalUser');


    if (status.length > 0) {
      selectQueryBuilder.andWhere(new Brackets((qb => {
        status.forEach((value, index) => {
          const param = {};
          param[`status${index}`] = value;
          qb.orWhere(`association.status=:status${index}`, param);
        });
      })));
    }
    return selectQueryBuilder
      .setParameter('portalUser', portalUser.id)
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