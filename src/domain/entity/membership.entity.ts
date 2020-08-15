import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';
import { PortalAccount } from './portal-account.entity';
import { PortalUser } from './portal-user.entity';

@Entity()
export class Membership extends BaseEntity {


  @ManyToOne(type => PortalUser)
  portalUser: PortalUser;

  @ManyToOne(type => PortalAccount)
  @JoinColumn({ name: 'portalAccountId' })
  portalAccount: PortalAccount;

  @PrimaryColumn()
  portalAccountId: number;

  @Column({
    nullable: true,
  })
  code: string;


}
