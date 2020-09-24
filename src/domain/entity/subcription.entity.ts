import { BaseEntity } from '../../common/base.entity';
import { Column, Entity } from 'typeorm';


@Entity()
export class Subscription extends BaseEntity {
  @Column()
  code: string;

  @Column()
  description: string;

  @Column({
    type: 'timestamp',
  })
  startDate: Date;

  @Column({
    type: 'timestamp',
  })
  endDate: Date;

}