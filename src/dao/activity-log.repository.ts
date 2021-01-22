import { BaseRepository } from '../common/BaseRepository';
import { EntityRepository } from 'typeorm';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';
import { Association } from '../domain/entity/association.entity';
import { ActivityLog } from '../domain/entity/activity-log.entity';

@EntityRepository(ActivityLog)
export class ActivityLogRepository extends BaseRepository<ActivityLog> {

  findByAssociationAndLimitAndOffset(association: Association, limit = 20, offset = 0, status = GenericStatusConstant.ACTIVE) {
    return this.createQueryBuilder('log')
      .where('log.association = :association', { association: association.id })
      .andWhere('log.status = :status', { status })
      .limit(limit)
      .offset(offset)
      .getManyAndCount();
  }
}