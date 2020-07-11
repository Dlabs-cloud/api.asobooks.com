import {BaseRepository} from '../common/BaseRepository';
import {EntityRepository} from 'typeorm';
import {Setting} from '../domain/entity/setting.entity';
import {GenericStatusConstant} from '../domain/enums/generic-status-constant';

@EntityRepository(Setting)
export class SettingRepository extends BaseRepository<Setting> {

    async findInLabels(...labels: string[]): Promise<Setting[]> {
        return await this.createQueryBuilder()
            .where('label IN (:...labels)')
            .andWhere('status = :status')
            .setParameter('labels', labels)
            .setParameter('status', GenericStatusConstant.ACTIVE)
            .getMany();
    }
}
