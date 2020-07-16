import { Brackets, FindConditions, Repository } from 'typeorm';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';
import { BaseEntity } from './base.entity';

export abstract class BaseRepository<T extends BaseEntity> extends Repository<T> {

  public findItem(findOptions: FindConditions<T>, status: GenericStatusConstant = GenericStatusConstant.ACTIVE): Promise<T[]> {
    const statusVal = { status };
    return this.find({
      where: { ...findOptions, ...statusVal },
    });
  }

  public findOneItem(findOptions: FindConditions<T>, status: GenericStatusConstant = GenericStatusConstant.ACTIVE): Promise<T> {
    return this.findOne({
      where: { ...findOptions, ...{ status } },
    });
  }

  public findByIdAndStatus(id: number, ...status: GenericStatusConstant[]) {
    const selectQueryBuilder = this.createQueryBuilder()
      .select()
      .where('id =:id', { id });
    selectQueryBuilder.andWhere(new Brackets((qb => {
      status.forEach((value, index) => {
        const param = {};
        param[`status${index}`] = value;
        qb.orWhere(`status=:status${index}`, param);
      });
    })));

    return selectQueryBuilder.getOne();

  }
}
