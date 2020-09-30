import { BaseRepository } from '../common/BaseRepository';
import { Subscription } from '../domain/entity/subcription.entity';
import { EntityRepository } from 'typeorm';

@EntityRepository(Subscription)
export class SubscriptionRepository extends BaseRepository<Subscription> {


}