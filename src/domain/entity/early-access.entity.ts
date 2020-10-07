import { BaseEntity } from '../../common/base.entity';
import { Column, Entity } from 'typeorm';


@Entity()
export class EarlyAccess extends BaseEntity {
  @Column({
    nullable: true,
  })
  name: string;
  @Column()
  email: string;
}