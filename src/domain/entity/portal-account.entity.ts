import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
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
    eager: true,
  })
  @JoinColumn({ name: 'associationId', referencedColumnName: 'id' })
  association: Association;

  @Column({ nullable: true })
  associationId?: number;
}
