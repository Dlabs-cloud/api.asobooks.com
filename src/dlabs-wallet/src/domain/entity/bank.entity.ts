import { BaseEntity } from '../../../../common/base.entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class Bank extends BaseEntity {
  @Column({
    unique: true,
  })
  name: string;
  @Column({
    unique: true,
  })
  code: string;

  @Column({
    unique: true,
    nullable: true,
  })
  payStackCode?: string;

}