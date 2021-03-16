import { BaseRepository } from '../common/BaseRepository';
import { WalletTransaction } from '../domain/entity/wallet-transaction.entity';
import { EntityRepository } from 'typeorm';
import { Association } from '../domain/entity/association.entity';
import { Wallet } from '../domain/entity/wallet.entity';

@EntityRepository(WalletTransaction)
export class WalletTransactionRepository extends BaseRepository<WalletTransaction> {

  findWalletByStartDateAndEndDateAssociation(startDate: Date, endDate: Date, association: Association) {
    return this
      .createQueryBuilder('walletTransaction')
      .select()
      .innerJoin(Wallet, 'wallet', 'wallet.id = walletTransaction.walletId')
      .where('wallet.association = :association', { association: association.id })
      .andWhere('walletTransaction.updatedAt >= startDate', { startDate })
      .andWhere('walletTransaction.updatedAt <= endDate', { endDate })
      .limit(1)
      .getOne();
  }
}
