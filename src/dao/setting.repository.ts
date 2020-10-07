import { BaseRepository } from '../common/BaseRepository';
import { EntityRepository } from 'typeorm';
import { Setting } from '../domain/entity/setting.entity';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';

@EntityRepository(Setting)
export class SettingRepository extends BaseRepository<Setting> {

  findInLabels(...labels: string[]): Promise<Setting[]> {
    return this.createQueryBuilder()
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

    if (Setting) {
      return setting;
    }

    let newSetting = new Setting();
    newSetting.label = label;
    newSetting.value = defaultValue;
    return this.save(newSetting);

  }
}
