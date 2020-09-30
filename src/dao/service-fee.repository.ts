import { BaseRepository } from '../common/BaseRepository';
import { ServiceFee } from '../domain/entity/service.fee.entity';
import { EntityRepository } from 'typeorm';
import { Association } from '../domain/entity/association.entity';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';
import { Subscription } from '../domain/entity/subcription.entity';

@EntityRepository(ServiceFee)
export class ServiceFeeRepository extends BaseRepository<ServiceFee> {

  public findByCodeAndAssociation(code: string, association: Association, status = GenericStatusConstant.ACTIVE) {
    return this.createQueryBuilder('serviceFee')
      .select()
      .innerJoin(Association, 'association', 'serviceFee.association=association.id ')
      .where('serviceFee.code =:code')
      .andWhere('association.id =:association')
      .andWhere('serviceFee.status =:status')
      .setParameter('code', code)
      .setParameter('association', association.id)
      .setParameter('status', status)
      .getOne();
  }

  public findServiceFeeBetweenNextBillingDate(startDate: Date,
                                              endDate: Date,
                                              status = GenericStatusConstant.ACTIVE) {
    return this.createQueryBuilder('serviceFee')
      .select()
      .where('serviceFee.status = :status')
      .andWhere('serviceFee.nextBillingDate >= :startDate')
      .andWhere('serviceFee.nextBillingDate <= :endDate')
      .andWhere(qb => {
        let query = qb.subQuery()
          .select('id')
          .from(Subscription, 'subscription')
          .andWhere('status = :status')
          .getQuery();
        return `serviceFee.id NOT IN ${query}`;
      })
      .setParameter('status', status)
      .setParameter('startDate', startDate)
      .setParameter('endDate', endDate)
      .getMany();

  }


}