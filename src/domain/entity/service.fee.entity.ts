import { BaseEntity } from '../../common/base.entity';
import { Column, CreateDateColumn, Entity, ManyToOne } from 'typeorm';
import { ServiceTypeConstant } from '../enums/service-type.constant';
import { Association } from './association.entity';
import { BillingCycleConstant } from '../enums/billing-cycle.constant';

@Entity()
export class ServiceFee extends BaseEntity {

  @Column()
  name: string;

  @Column()
  code: string;

  @Column({
    type: 'bigint',
  })
  amountInMinorUnit: number;

  @Column({})
  description: string;

  @Column({
    type: 'enum',
    enum: ServiceTypeConstant,
  })
  type: ServiceTypeConstant;

  @ManyToOne(() => Association)
  association: Association;

  @Column({
    type: 'enum',
    enum: BillingCycleConstant,
  })
  cycle: BillingCycleConstant;

  @Column({
    type: 'timestamp',
  })
  billingStartDate: Date;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  nextBillingDate?: Date;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  dueDate?: Date;
}