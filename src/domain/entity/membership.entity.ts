import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryColumn } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';
import { PortalAccount } from './portal-account.entity';
import { PortalUser } from './portal-user.entity';
import { Address } from './address.entity';

@Entity()
export class Membership extends BaseEntity {


  @ManyToOne(type => PortalUser)
  @JoinColumn({ name: 'portalUserId', referencedColumnName: 'id' })
  portalUser: PortalUser;

  @Column({ nullable: true })
  portalUserId: number;

  @ManyToOne(type => PortalAccount)
  @JoinColumn({ name: 'portalAccountId', referencedColumnName: 'id' })
  portalAccount: PortalAccount;

  @Column({ nullable: true })
  portalAccountId?: number;

  @Column({
    nullable: true,
  })
  identificationNumber: string;

  @OneToOne(() => Address)
  @JoinColumn()
  address: Address;


}
