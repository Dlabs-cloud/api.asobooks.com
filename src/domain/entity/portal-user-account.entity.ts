import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';
import { PortalAccount } from './portal-account.entity';
import { PortalUser } from './portal-user.entity';
import { Association } from './association.entity';

@Entity()
export class PortalUserAccount extends BaseEntity {

  @ManyToOne(type => PortalAccount)
  portalAccount: PortalAccount;

  @ManyToOne(type => PortalUser)
  portalUser: PortalUser;

  @ManyToOne(() => Association, {
    nullable: false,
  })
  association: Association;


}
