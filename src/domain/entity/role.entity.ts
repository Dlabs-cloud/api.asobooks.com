import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';
import { Association } from './association.entity';

@Entity()
export class Role extends BaseEntity {
  @Column()
  name: string;
  @Column()
  code: string;

  @ManyToOne(() => Association)
  association: Association;

}