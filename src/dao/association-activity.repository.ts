import {BaseRepository} from '../common/BaseRepository';
import {EntityRepository} from 'typeorm';
import {GenericStatusConstant} from '../domain/enums/generic-status-constant';
import {AssociationActivityEntity} from "../domain/entity/association-activity.entity";

@EntityRepository(AssociationActivityEntity)
export class AssociationActivityRepository extends BaseRepository<AssociationActivityEntity> {

    findAssociationActivitiesById(associationId: number, status = GenericStatusConstant.ACTIVE, limit = 20, offset = 0) {
        return this.createQueryBuilder('association-activity')
            .where("association-activity.associationId = :associationId", {associationId})
            .andWhere('association-activity.status = :status', {status})
            .limit(limit)
            .take(offset)
            .getMany();
    }
}