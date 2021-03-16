import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { Wallet } from './wallet.entity';
import { PaymentType } from '../enums/payment-type.enum';
import { PaymentTransaction } from './payment-transaction.entity';
import { BaseEntity } from '../../common/base.entity';
import { WalletWithdrawal } from './wallet-withdrawal.entity';


@Entity()
export class WalletTransaction extends BaseEntity {

  @Column({
    type: 'bigint',
  })
  amount: number;

  @ManyToOne(() => Wallet)
  wallet: Wallet;

  @Column(({
    enum: PaymentType,
    type: 'enum',
  }))
  paymentType: PaymentType;

  @OneToOne(() => PaymentTransaction)
  @JoinColumn()
  paymentTransaction: PaymentTransaction;

  @OneToOne(() => WalletWithdrawal)
  @JoinColumn()
  walletWithdrawal: WalletWithdrawal;

  @Column({
    type: 'bigint',
  })
  previousWalletBalanceInMinorUnit: number;

  @Column({
    type: 'bigint',
  })
  walletBalance: number;


}
