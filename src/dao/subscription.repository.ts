import { BaseRepository } from '../common/BaseRepository';
import { Subscription } from '../domain/entity/subcription.entity';
import { EntityRepository } from 'typeorm';
import { ServiceFee } from '../domain/entity/service.fee.entity';
import { GroupServiceFee } from '../domain/entity/group-sevice-fee.entity';
import { Group } from '../domain/entity/group.entity';
import { GroupMembership } from '../domain/entity/group-membership.entity';
import { Membership } from '../domain/entity/membership.entity';
import { Bill } from '../domain/entity/bill.entity';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';

@EntityRepository(Subscription)
export class SubscriptionRepository extends BaseRepository<Subscription> {


}