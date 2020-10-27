import { BaseEntity } from '../../../../common/base.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { WalletType } from '../enum/wallet-type.enum';
import { Bank } from './bank.entity';
import { BankInfo } from './bank-info.entity';

@Entity()
export class Wallet extends BaseEntity {

  @Column({
    type: 'bigint',
    default: 0,
  })
  availableBalance: number;
  @Column({
    type: 'bigint',
    default: 0,
  })
  bookBalance: number;

  @Column({
    unique: true,
  })
  reference: string;

  @Column({
    enum: WalletType,
    type: 'enum',
  })
  walletType: WalletType;

  @ManyToOne(() => BankInfo)
  bank: BankInfo;

}