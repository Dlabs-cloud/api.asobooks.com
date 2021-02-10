import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryColumn } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';
import { PortalAccount } from './portal-account.entity';
import { PortalUser } from './portal-user.entity';
import { Address } from './address.entity';
import { MembershipInfo } from './association-member-info.entity';
import { Role } from './role.entity';

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

  @ManyToOne(() => MembershipInfo)
  membershipInfo: MembershipInfo;

  @Column({ nullable: true })
  membershipInfoId?: number;

  @ManyToOne(() => Role, { nullable: true })
  role: Role;

}
