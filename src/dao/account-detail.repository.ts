import { BaseRepository } from '../common/BaseRepository';
import { AccountDetail } from '../domain/entity/account-detail.entity';
import { EntityRepository } from 'typeorm';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';
import { Bank } from '../domain/entity/bank.entity';

@EntityRepository(AccountDetail)
export class AccountDetailRepository extends BaseRepository<AccountDetail> {

  findByAccountNumberAndBank(accountNumber: string, bank: Bank, status = GenericStatusConstant.ACTIVE) {
    return this.findOne({
      number: accountNumber,
      bank,
      status,
    }, { relations: ['bank'] });
  }
}
