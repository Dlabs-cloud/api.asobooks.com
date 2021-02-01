import { BaseEntity } from '../../common/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { identifier } from 'aws-sdk/clients/frauddetector';
import { Address } from './address.entity';
import { Association } from './association.entity';
import { PortalUser } from './portal-user.entity';

@Entity()
export class MembershipInfo extends BaseEntity {
  @Column()
  identifier: identifier;

  @ManyToOne(() => Address)
  @JoinColumn({ name: 'addressId', referencedColumnName: 'id' })
  address: Address;

  @Column({ nullable: true })
  addressId: number;

  @ManyToOne(() => Association)
  association: Association;


  @ManyToOne(() => PortalUser)
  @JoinColumn({ name: 'portalUserId', referencedColumnName: 'id' })
  portalUser: PortalUser;

  @Column({ nullable: false })
  portalUserId: number;


}