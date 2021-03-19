import { Column, Entity, ManyToOne } from 'typeorm';
import { Membership } from './membership.entity';
import { BaseEntity } from '../../common/base.entity';
import { BankInfo } from './bank-info.entity';
import { Wallet } from './wallet.entity';
import { WalletWithdrawalEnum } from '../enums/wallet.withdrawal.enum';

@Entity()
export class WalletWithdrawal extends BaseEntity {
  @ManyToOne(() => Membership)
  initiatedBy: Membership;
  @Column()
  description: string;
  @Column({ type: 'bigint' })
  amountInMinorUnit: number;
  @ManyToOne(() => BankInfo)
  bankInfo: BankInfo;
  @Column({ unique: true })
  reference: string;
  @ManyToOne(() => Wallet)
  wallet: Wallet;
  @Column({ nullable: true })
  walletId: number;
  @Column({
    type: 'enum',
    enum: WalletWithdrawalEnum,
    default: WalletWithdrawalEnum.PENDING,
  })
  withdrawalStatus: WalletWithdrawalEnum;
  @Column({ nullable: true, unique: true })
  merchantReference: string;


}
