import { BaseRepository } from '../common/BaseRepository';
import { EntityRepository } from 'typeorm';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';
import { Association } from '../domain/entity/association.entity';
import { ActivityLog } from '../domain/entity/activity-log.entity';
import { ActivityLogQueryDto } from '../dto/activity-log.query.dto';

@EntityRepository(ActivityLog)
export class ActivityLogRepository extends BaseRepository<ActivityLog> {

  findByAssociationAndQuery(association: Association, query: ActivityLogQueryDto, status = GenericStatusConstant.ACTIVE) {
    const builder = this.createQueryBuilder('log')
      .where('log.association = :association', { association: association.id })
      .andWhere('log.status = :status', { status })
      .limit(query.limit)
      .offset(query.offset);

    if (query.type) {
      builder.andWhere('log.activityType =: type', { type: query.type });
    }

    return builder.getManyAndCount();
  }
}
