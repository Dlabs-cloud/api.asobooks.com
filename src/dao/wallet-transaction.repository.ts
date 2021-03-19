import { BaseRepository } from '../common/BaseRepository';
import { WalletTransaction } from '../domain/entity/wallet-transaction.entity';
import { EntityRepository } from 'typeorm';
import { Association } from '../domain/entity/association.entity';
import { Wallet } from '../domain/entity/wallet.entity';

@EntityRepository(WalletTransaction)
export class WalletTransactionRepository extends BaseRepository<WalletTransaction> {

  findByStartDateAndEndDateWallet(startDate: Date, endDate: Date, wallet: Wallet) {
    return this
      .createQueryBuilder('walletTransaction')
      .select()
      .where('walletTransaction.wallet = :walletId', { walletId: wallet.id })
      .andWhere('walletTransaction.updatedAt >= :startDate', { startDate })
      .andWhere('walletTransaction.updatedAt <= :endDate', { endDate })
      .take(1)
      .getOne();
  }
}
