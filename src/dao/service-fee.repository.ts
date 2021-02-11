import { BaseRepository } from '../common/BaseRepository';
import { ServiceFee } from '../domain/entity/service.fee.entity';
import { EntityRepository } from 'typeorm';
import { Association } from '../domain/entity/association.entity';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';
import { Subscription } from '../domain/entity/subcription.entity';
import { ServiceTypeConstant } from '../domain/enums/service-type.constant';
import { ServiceFeeQueryDto } from '../dto/service-fee-query.dto';
import * as moment from 'moment';

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


  findByQueryAndAssociation(query: ServiceFeeQueryDto, association: Association) {
    const builder = this.createQueryBuilder('serviceFee')
      .where('serviceFee.association = :association', { association: association.id })
      .limit(query.limit)
      .offset(query.offset);
    if (query.frequency) {
      builder.andWhere('serviceFee.cycle = :cycle', { cycle: query.frequency });
    }
    if (query.dateCreatedBefore) {
      const date = moment(query.dateCreatedBefore, 'DD/MM/YYYY').endOf('day').toDate();
      builder.andWhere('serviceFee.createdAt <= :createdBefore', { createdBefore: date });
    }
    if (query.dateCreatedAfter) {
      const date = moment(query.dateCreatedAfter, 'DD/MM/YYYY').startOf('day').toDate();
      builder.andWhere('serviceFee.createdAt >= :createdAfter', { createdAfter: date });
    }
    if (query.startDateBefore) {
      const date = moment(query.startDateBefore, 'DD/MM/YYYY').endOf('day').toDate();
      builder.andWhere('serviceFee.billingStartDate <= :startDateBefore', { startDateBefore: date });
    }
    if (query.startDateAfter) {
      const date = moment(query.startDateAfter, 'DD/MM/YYYY').startOf('day').toDate();
      builder.andWhere('serviceFee.billingStartDate >= :startDateAfter', { startDateAfter: date });
    }
    return builder.getManyAndCount();

  }

  public findForAllGeneratedSubscriptionsByStateDateAndEndDateAndStatusType(startDate: Date,
                                                                            endDate: Date,
                                                                            serviceType: ServiceTypeConstant,
                                                                            status = GenericStatusConstant.ACTIVE) {

    let serviceFeeSelectQueryBuilder = this.createQueryBuilder('serviceFee')
      .select()
      .where('serviceFee.status = :status')
      .andWhere(qb => {
        let query = qb.subQuery()
          .select('serviceFee.id')
          .from(Subscription, 'subscription')
          .innerJoin(ServiceFee, 'serviceFee', 'serviceFee.id = subscription.serviceFee')
          .andWhere('serviceFee.status = :status')
          .getQuery();
        return `serviceFee.id NOT IN ${query}`;
      })
      .andWhere('serviceFee.type = :type');

    if (ServiceTypeConstant.RE_OCCURRING === serviceType) {
      serviceFeeSelectQueryBuilder
        .andWhere('serviceFee.nextBillingEndDate >= :startDate')
        .andWhere('serviceFee.nextBillingEndDate <= :endDate');
    } else {
      serviceFeeSelectQueryBuilder
        .andWhere('serviceFee.billingStartDate >= :startDate')
        .andWhere('serviceFee.billingStartDate <= :endDate');
    }
    return serviceFeeSelectQueryBuilder
      .setParameter('status', status)
      .setParameter('startDate', startDate)
      .setParameter('endDate', endDate)
      .setParameter('type', serviceType)
      .getMany();
  }


}