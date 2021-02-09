import { BaseRepository } from '../common/BaseRepository';

import { EntityRepository } from 'typeorm';
import { Bank } from '../domain/entity/bank.entity';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';

@EntityRepository(Bank)
export class BankRepository extends BaseRepository<Bank> {

  findByCode(code: string, status: GenericStatusConstant = GenericStatusConstant.ACTIVE) {
    return this.findOneItemByStatus({ code }, status);
  }

  getAll() {
    return this.createQueryBuilder('bank')
      .where('status = :status', { status: GenericStatusConstant.ACTIVE })
      .addOrderBy('name', 'ASC')
      .getMany();
  }
}