import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { Wallet } from './wallet.entity';
import { PaymentType } from '../enums/payment-type.enum';
import { PaymentTransaction } from './payment-transaction.entity';
import { BaseEntity } from '../../common/base.entity';
import { WalletWithdrawal } from './wallet-withdrawal.entity';
import { Membership } from './membership.entity';


@Entity()
export class WalletTransaction extends BaseEntity {

  @ManyToOne(() => Membership, { nullable: false })
  initiatedBy: Membership;

  @Column({
    type: 'bigint',
  })
  amountInMinorUnit: number;

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

  @Column({
    type: 'bigint',
  })
  previousWalletBalanceInMinorUnit: number;

  @Column({
    type: 'bigint',
  })
  walletBalanceInMinorUnit: number;


}
