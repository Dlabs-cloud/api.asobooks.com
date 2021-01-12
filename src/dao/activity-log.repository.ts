import { BaseRepository } from '../common/BaseRepository';
import { EntityRepository } from 'typeorm';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';
import { ActivityLogEntity } from '../domain/entity/activity-log.entity';
import { Association } from '../domain/entity/association.entity';

@EntityRepository(ActivityLogEntity)
export class ActivityLogRepository extends BaseRepository<ActivityLogEntity> {

  findByAssociationAndLimitAndOffset(association: Association, limit = 20, offset = 0, status = GenericStatusConstant.ACTIVE) {
    return this.createQueryBuilder('log')
      .where('log.association = :association', { association: association.id })
      .andWhere('log.status = :status', { status })
      .limit(limit)
      .offset(offset)
      .getManyAndCount();
  }
}