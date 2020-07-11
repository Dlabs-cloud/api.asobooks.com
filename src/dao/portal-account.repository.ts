import {EntityRepository} from 'typeorm';
import {BaseRepository} from '../common/BaseRepository';
import {PortalAccount} from '../domain/entity/portal-account.entity';

@EntityRepository(PortalAccount)
export class PortalAccountRepository extends BaseRepository<PortalAccount> {

}