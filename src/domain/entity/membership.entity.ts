import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';
import { PortalAccount } from './portal-account.entity';
import { PortalUser } from './portal-user.entity';
import { Association } from './association.entity';

@Entity()
export class Membership extends BaseEntity {

  @ManyToOne(type => PortalAccount)
  @JoinColumn({
    name: 'portalAccountId',
  })
  portalAccount: PortalAccount;

  @ManyToOne(type => PortalUser)
  portalUser: PortalUser;

  @ManyToOne(() => Association, {
    nullable: false,
  })
  @JoinColumn({
    name: 'associationId',
  })
  association: Association;

  @PrimaryColumn()
  associationId?: number;

  @PrimaryColumn()
  portalAccountId: number;
  @Column()
  code: string;


}
