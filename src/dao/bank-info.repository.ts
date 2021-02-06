import { BankInfo } from '../domain/entity/bank-info.entity';
import { BaseRepository } from '../common/BaseRepository';
import { EntityRepository } from 'typeorm';
import { Association } from '../domain/entity/association.entity';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';

@EntityRepository(BankInfo)
export class BankInfoRepository extends BaseRepository<BankInfo> {

  countByAssociation(association: Association, status = GenericStatusConstant.ACTIVE) {
    return this.createQueryBuilder('bankInfo').select()
      .innerJoin(Association, 'association', 'bankInfo.association=association.id')
      .where('association.id = :association')
      .andWhere('bankInfo.status = :status')
      .setParameter('association', association.id)
      .setParameter('status', status)
      .getCount();
  }
}

