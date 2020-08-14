import { BaseEntity } from '../../common/base.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { Address } from './address.entity';
import { Membership } from './membership.entity';

@Entity()
export class MembershipInfo extends BaseEntity {
  @Column({
    nullable: true,
  })
  identificationNumber: string;
  @OneToOne(() => Address)
  @JoinColumn()
  address: Address;
  @OneToOne(() => Membership)
  @JoinColumn()
  membership: Membership;
}