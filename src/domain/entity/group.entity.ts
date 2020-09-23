import { BaseEntity } from '../../common/base.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Association } from './association.entity';
import { PortalAccount } from './portal-account.entity';
import { GroupTypeConstant } from '../enums/group-type.constant';
import { GenericStatusConstant } from '../enums/generic-status-constant';

@Entity()
export class Group extends BaseEntity {

  @Column()
  name: string;

  @ManyToOne(type => Association)
  association: Association;

  @Column({
    type: 'enum',
    enum: GroupTypeConstant,
  })
  type: GroupTypeConstant;
}