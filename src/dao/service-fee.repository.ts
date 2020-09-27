import { BaseRepository } from '../common/BaseRepository';
import { ServiceFee } from '../domain/entity/service.fee.entity';
import { EntityRepository } from 'typeorm';
import { Association } from '../domain/entity/association.entity';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';
import { Group } from '../domain/entity/group.entity';
import { GroupServiceFee } from '../domain/entity/group-sevice-fee.entity';

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


}