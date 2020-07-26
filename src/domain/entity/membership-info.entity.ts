import { BaseEntity } from '../../common/base.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { Address } from './address.entity';
import { PortalUserAccount } from './portal-user-account.entity';

@Entity()
export class Membership extends BaseEntity {
  @Column()
  identificationNumber: string;
  @OneToOne(() => Address)
  @JoinColumn()
  address: Address;
  @OneToOne(() => PortalUserAccount)
  @JoinColumn()
  portalUserAccount: PortalUserAccount;
}