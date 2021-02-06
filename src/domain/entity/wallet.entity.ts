import { Column, Entity, ManyToOne } from 'typeorm';
import { BankInfo } from './bank-info.entity';
import { BaseEntity } from '../../common/base.entity';
import { Association } from './association.entity';

@Entity()
export class Wallet extends BaseEntity {

  @Column({
    type: 'bigint',
    default: 0,
  })
  availableBalanceInMinorUnits: number;

  @Column({
    unique: true,
  })
  reference: string;

  @ManyToOne(() => BankInfo, { nullable: true })
  bank: BankInfo;

  @ManyToOne(() => Association)
  association: Association;

}