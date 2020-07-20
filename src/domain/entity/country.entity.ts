import { BaseEntity } from '../../common/base.entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class Country extends BaseEntity {
  @Column()
  name: string;
  @Column()
  code: string;
}