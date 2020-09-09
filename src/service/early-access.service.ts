import { EarlyAccessRepository as EAccessRepository } from '../dao/early-access.repository';
import { EarlyAccess } from '../domain/entity/early-access.entity';
import { Injectable } from '@nestjs/common';
import { Connection } from 'typeorm';
import { EarlyAccessRepository } from '@dlabs/nestjs-early-starter';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';

@Injectable()
export class EarlyAccessService implements EarlyAccessRepository {
  constructor(private readonly connection: Connection) {
  }

  create(email: string, name?: string): Promise<boolean> {
    let earlyAccess = new EarlyAccess();
    earlyAccess.email = email;
    earlyAccess.name = name;
    return this.connection.getCustomRepository(EAccessRepository)
      .save(earlyAccess).then(earlyAccess => {
        return Promise.resolve(true);
      }).catch(failure => {
        return Promise.resolve(false);
      });
  }

  delete(email: string): Promise<boolean> {

    return this.connection.transaction(entityManager =>
      entityManager.getCustomRepository(EAccessRepository).findOneItemByStatus({
        email,
      }).then(earlyAccess => {
        earlyAccess.status = GenericStatusConstant.IN_ACTIVE;
        return entityManager.save(earlyAccess);
      }).then(() => Promise.resolve(true))
        .catch(() => Promise.resolve(false)));
  }

  find(email: string) {
    return this.connection
      .getCustomRepository(EAccessRepository)
      .findOneItemByStatus({ email });
  }

}