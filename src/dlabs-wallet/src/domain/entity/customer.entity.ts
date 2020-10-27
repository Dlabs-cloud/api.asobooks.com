import { BaseEntity } from '../../../../common/base.entity';
import { Column, Entity } from 'typeorm';
import { CustomerType } from '../enum/customer-type.enum';
import { GenericStatusConstant } from '../../../../domain/enums/generic-status-constant';

@Entity()
export class Customer extends BaseEntity {
  @Column()
  name: string;
  @Column({
    unique: true,
  })
  email: string;
  @Column({
    unique: true,
  })
  phoneNumber: string;
  @Column({
    unique: true,
    nullable: true,
  })
  bvn: string;
  @Column({
    type: 'enum',
    enum: CustomerType,
  })
  type: CustomerType;

}