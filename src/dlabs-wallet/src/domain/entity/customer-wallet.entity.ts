import { BaseEntity } from '../../../../common/base.entity';
import { Entity, ManyToOne } from 'typeorm';
import { Wallet } from './wallet.entity';
import { Customer } from './customer.entity';

@Entity()
export class CustomerWallet extends BaseEntity {
  @ManyToOne(() => Wallet)
  wallet: Wallet;
  @ManyToOne(() => Customer)
  customer: Customer;
}