import {BaseRepository} from '../common/BaseRepository';
import {ServiceFee} from '../domain/entity/service.fee.entity';
import {EntityRepository} from 'typeorm';
import {Association} from '../domain/entity/association.entity';
import {GenericStatusConstant} from '../domain/enums/generic-status-constant';
import {Subscription} from '../domain/entity/subcription.entity';
import {ServiceTypeConstant} from '../domain/enums/service-type.constant';
import {ServiceFeeFilterDto} from "../dto/service-fee-filter.dto";

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


    public getAllServiceFeeByAssociationCodeAndStatus(association: Association,
                                                      status = GenericStatusConstant.ACTIVE,
                                                      filter: ServiceFeeFilterDto) {
        let builder = this.createQueryBuilder('serviceFee')
            .select()
            .innerJoin(Association, 'association', 'serviceFee.association=association.id ')
            .andWhere('association.id =:association')
            .andWhere('serviceFee.status =:status')
            .limit(filter.limit)
            .take(filter.offset);

        if (filter.type) {
            builder.andWhere('serviceFee.type =:type', {type: filter.type})
        }

        return builder.setParameter('association', association.id)
            .setParameter('status', status)
            .getMany()
    }
}