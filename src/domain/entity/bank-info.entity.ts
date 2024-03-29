import { BaseEntity } from '../../common/base.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Bank } from './bank.entity';
import { Association } from './association.entity';

@Entity()
export class BankInfo extends BaseEntity {
  @Column()
  accountNumber: string;
  @ManyToOne(() => Bank, { eager: true })
  bank: Bank;
  @Column({ nullable: true })
  bankId: number;
  @Column({
    nullable: true,
  })
  payStackRef: string;
}
