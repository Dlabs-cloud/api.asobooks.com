import { BaseRepository } from '../common/BaseRepository';
import { EntityRepository } from 'typeorm';
import { Setting } from '../domain/entity/setting.entity';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';
import { Some } from 'optional-typescript';

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

  async findByLabel(label: string, defaultValue: string) {
    let setting = await this.createQueryBuilder()
      .where('label=:label')
      .andWhere('status = :status')
      .setParameter('label', label)
      .setParameter('status', GenericStatusConstant.ACTIVE)
      .getOne();
    return (await Some<Setting>(setting)
      .ifNoneAsync(async () => {
        let newSetting = new Setting();
        newSetting.label = label;
        newSetting.value = defaultValue;
        await this.save(newSetting);
        return newSetting;
      })).valueOrNull();

  }
}
