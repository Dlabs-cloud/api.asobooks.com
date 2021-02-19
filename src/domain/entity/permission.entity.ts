import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';

@Entity()
export class Permission extends BaseEntity {
  @Column()
  name: string;

  @Column()
  code: string;
}