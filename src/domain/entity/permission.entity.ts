import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';

@Entity()
export class Permission extends BaseEntity {
  @Column({ unique: true })
  name: string;


  @Column({ unique: true })
  code: string;
}
