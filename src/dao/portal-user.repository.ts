import {EntityRepository} from 'typeorm';
import {BaseRepository} from '../common/BaseRepository';
import {PortalUser} from '../domain/entity/portal-user.entity';
import {PortalAccount} from '../domain/entity/portal-account.entity';
import {Membership} from '../domain/entity/membership.entity';
import {GenericStatusConstant} from '../domain/enums/generic-status-constant';

@EntityRepository(PortalUser)
export class PortalUserRepository extends BaseRepository<PortalUser> {

    countPortalUserByEmailAndAccount(email: string, portalAccount?: PortalAccount) {
        return this.queryPortalUserByEmailAndAccount(email, portalAccount).getCount();
    }

    queryPortalUserByEmailAndAccount(email: string, portalAccount?: PortalAccount) {
        const portalUserSelectQueryBuilder = this.createQueryBuilder('portalUser')
            .innerJoin(Membership, 'membership', 'membership.portalUser=portalUser.id')
            .innerJoin(PortalAccount, 'portalAccount', 'portalAccount.id=portalUserAccount.portalAccount')
            .andWhere('portalUser.email = :email')
            .andWhere('portalUserAccount.portalAccount = :portalAccount')
            .setParameter('portalAccount', portalAccount.id);
        return portalUserSelectQueryBuilder.distinct(true);
    }

    countPortalUserByEmail(email: string) {
        return this.queryPortalUserByEmail(email).getCount();
    }

    private queryPortalUserByEmail(email: string) {
        return this.createQueryBuilder('portalUser')
            .where('portalUser.status = :status')
            .andWhere('portalUser.email = :email')
            .setParameter('email', email)
            .setParameter('status', GenericStatusConstant.ACTIVE);
    }

    public findByUserNameOrEmailOrPhoneNumber(usernameOrEmailOrPhone: string) {
        return this
            .createQueryBuilder('portalUser')
            .select()
            .orWhere('portalUser.username = :username')
            .orWhere('portalUser.email = :username')
            .orWhere('portalUser.phoneNumber = :username')
            .where('portalUser.status = :status')
            .setParameter('status', GenericStatusConstant.ACTIVE)
            .setParameter('username', usernameOrEmailOrPhone)
            .distinct()
            .getOne();
    }
}