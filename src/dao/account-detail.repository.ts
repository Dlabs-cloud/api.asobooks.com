import { BaseRepository } from '../common/BaseRepository';
import { AccountDetail } from '../domain/entity/account-detail.entity';
import { EntityRepository } from 'typeorm';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';

@EntityRepository(AccountDetail)
export class AccountDetailRepository extends BaseRepository<AccountDetail> {

  findByAccountNumber(accountNumber: string, status = GenericStatusConstant.ACTIVE) {
    return this.findOne({
      number: accountNumber,
      status,
    }, { relations: ['bank'] });
  }
}
