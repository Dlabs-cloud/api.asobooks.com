import {
  Column,
  Entity,
  Generated,
  JoinColumn,
  ManyToOne,
  ObjectID,
  ObjectIdColumn,
  OneToOne, PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from '../../common/base.entity';
import { PortalAccountTypeConstant } from '../enums/portal-account-type-constant';
import { Association } from './association.entity';

@Entity()
export class PortalAccount extends BaseEntity {
  @Column()
  name: string;

  @Column({
    unique: true,
  })
  code: string;

  @Column({
    type: 'enum',
    enum: PortalAccountTypeConstant,
  })
  type: PortalAccountTypeConstant;

  @ManyToOne(() => Association, {
    nullable: true,
  })
  @JoinColumn({ name: 'associationId' })
  association: Association;

  @PrimaryColumn()
  associationId?: number;
}
