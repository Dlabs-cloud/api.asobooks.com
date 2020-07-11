import {Column, Entity, JoinColumn, ManyToOne} from 'typeorm';
import {BaseEntity} from './base.entity';
import {PortalAccount} from './portal-account.entity';
import {PortalUser} from './portal-user.entity';

@Entity()
export class Membership extends BaseEntity {

    @ManyToOne(type => PortalAccount)
    @JoinColumn({name: 'portalAccountId'})
    portalAccount: PortalAccount;

    @ManyToOne(type => PortalUser)
    @JoinColumn({name: 'portalUserId'})
    portalUser: PortalUser;
}
