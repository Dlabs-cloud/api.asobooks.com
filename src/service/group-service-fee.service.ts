import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { GroupDto } from '../dto/group.dto';
import { ServiceFee } from '../domain/entity/service.fee.entity';
import { GroupService } from './group.service';
import { GroupServiceFee } from '../domain/entity/group-sevice-fee.entity';
import { Group } from '../domain/entity/group.entity';

@Injectable()
export class GroupServiceFeeService {


  public async createGroupForService(entityManager: EntityManager, group: Group, serviceFee: ServiceFee) {
    let groupService = new GroupServiceFee();
    groupService.group = group;
    groupService.serviceFee = serviceFee;
    return entityManager.save(group);
  }

}