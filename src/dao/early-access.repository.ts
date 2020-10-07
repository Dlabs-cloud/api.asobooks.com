import { BaseRepository } from '../common/BaseRepository';
import { EarlyAccess } from '../domain/entity/early-access.entity';
import { EntityRepository } from 'typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
@EntityRepository(EarlyAccess)
export class EarlyAccessRepository extends BaseRepository<EarlyAccess> {

}