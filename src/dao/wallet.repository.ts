import { BaseRepository } from '../common/BaseRepository';
import { Wallet } from '../domain/entity/wallet.entity';
import { EntityRepository } from 'typeorm';

@EntityRepository(Wallet)
export class WalletRepository extends BaseRepository<Wallet> {
  findByAssociation(association) {
    return this.findOne({
      association: association,
    });
  }
}