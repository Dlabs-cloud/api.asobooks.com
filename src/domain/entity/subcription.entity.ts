import { BaseEntity } from '../../common/base.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { ServiceFee } from './service.fee.entity';


@Entity()
export class Subscription extends BaseEntity {
  @Column()
  code: string;

  @Column()
  description: string;

  @Column({
    type: 'timestamp',
  })
  startDate: Date;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  endDate?: Date;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  dueDate: Date;

  @ManyToOne(() => ServiceFee)
  serviceFee: ServiceFee;

}