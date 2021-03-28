import { Brackets, FindConditions, Repository } from 'typeorm';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';
import { BaseEntity } from './base.entity';

export abstract class BaseRepository<T extends BaseEntity> extends Repository<T> {

  public findItem(findOptions: FindConditions<T>, status = GenericStatusConstant.ACTIVE): Promise<T[]> {
    const statusVal = { status };
    return this.find({
      where: { ...findOptions, ...statusVal },
    });
  }

  public findOneItemByStatus(findOptions: FindConditions<T>, status = GenericStatusConstant.ACTIVE): Promise<T> {
    return this.findOne({
      where: { ...findOptions, ...{ status } },
    });
  }

  public findByIdAndStatus(id: number, ...status: GenericStatusConstant[]): Promise<T | undefined> | Promise<undefined> {
    if (!id) {
      return Promise.resolve(undefined);
    }
    return this.createQueryBuilder()
      .select()
      .where('id =:id', { id })
      .andWhere('status IN (:...status)')
      .setParameter('status', status)
      .getOne();
  }

  findById(status = GenericStatusConstant.ACTIVE, ...ids: number[]) {
    return this.createQueryBuilder()
      .select()
      .whereInIds(ids)
      .andWhere('status = :status', { 'status': status })
      .getMany();
  }


}
