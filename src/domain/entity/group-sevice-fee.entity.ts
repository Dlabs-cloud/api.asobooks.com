import { BaseEntity } from '../../common/base.entity';
import { ServiceFee } from './service.fee.entity';
import { Entity, ManyToOne } from 'typeorm';
import { Group } from './group.entity';

@Entity()
export class GroupServiceFee extends BaseEntity {
  @ManyToOne(() => ServiceFee)
  serviceFee: ServiceFee;

  @ManyToOne(() => Group)
  group: Group;
}