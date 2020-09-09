import { EarlyAccessRepository as EAccessRepository } from '../dao/early-access.repository';
import { EarlyAccess } from '../domain/entity/early-access.entity';
import { Injectable } from '@nestjs/common';
import { Connection } from 'typeorm';
import { EarlyAccessRepository } from '@dlabs/nestjs-early-starter';

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
    return Promise.resolve(false);
  }

  find<T>(email: string): Promise<T> | Promise<null> {
    return Promise.resolve(undefined);
  }

}