import { BaseRepository } from '../common/BaseRepository';
import { WalletWithdrawal } from '../domain/entity/wallet-withdrawal.entity';
import { EntityRepository } from 'typeorm';

@EntityRepository(WalletWithdrawal)
export class WalletWithdrawalRepository extends BaseRepository<WalletWithdrawal> {

}
