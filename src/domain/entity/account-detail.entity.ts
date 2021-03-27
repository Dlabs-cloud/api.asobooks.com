import { BaseEntity } from '../../common/base.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Bank } from './bank.entity';

@Entity()
export class AccountDetail extends BaseEntity {

  @Column()
  name: string;

  @Column({ unique: true })
  number: string;

  @ManyToOne(() => Bank)
  bank: Bank;

  @Column({ nullable: true })
  bvn: string;
}
