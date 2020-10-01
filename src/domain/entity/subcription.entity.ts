import { BaseEntity } from '../../common/base.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { ServiceFee } from './service.fee.entity';
import { GenericStatusConstant } from '../enums/generic-status-constant';
import { ServiceTypeConstant } from '../enums/service-type.constant';


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

  @Column({
    type: 'enum',
    enum: ServiceTypeConstant,
  })
  serviceType: ServiceTypeConstant;


  @ManyToOne(() => ServiceFee)
  serviceFee: ServiceFee;

  @Column({
    nullable: true,
  })
  serviceFeeId;

}