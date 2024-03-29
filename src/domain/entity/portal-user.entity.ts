import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';
import { GenderConstant } from '../enums/gender-constant';

@Entity()
export class PortalUser extends BaseEntity {
  @Column()
  firstName: string;
  @Column()
  lastName: string;
  @Column()
  username: string;
  @Column({
    type: 'enum',
    enum: GenderConstant,
    nullable: true,
  })
  gender: GenderConstant;
  @Column()
  password: string;
  @Column()
  email: string;

  @Column({
    nullable: true,
  })
  phoneNumber: string;

  @ManyToOne(() => PortalUser, {
    nullable: true,
  })
  createdBy: PortalUser;
}
