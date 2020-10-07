import { EarlyAccessRepository as EAccessRepository } from '../dao/early-access.repository';
import { EarlyAccess } from '../domain/entity/early-access.entity';
import { Injectable } from '@nestjs/common';
import { Connection } from 'typeorm';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';
import { EarlyAccessRepository } from 'nestjs-early-access/index';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { Queues } from '../core/cron.enum';
import { SettingRepository } from '../dao/setting.repository';
import { IllegalArgumentException } from '../exception/illegal-argument.exception';

@Injectable()
export class EarlyAccessService implements EarlyAccessRepository {
  constructor(private readonly connection: Connection,
              @InjectQueue(Queues.EMAIL) private readonly emailQueue: Queue) {
  }

  async create(email: string, name?: string): Promise<boolean> {
    let earlyAccessRepository = this.connection.getCustomRepository(EAccessRepository);
    let settingRepository = await this.connection.getCustomRepository(SettingRepository);
    let coFounderEmail = await settingRepository.findByLabel('co_founder_email', 'faith@asobooks.com');
    let count = await earlyAccessRepository.count({ email });

    if (count) {
      return Promise.resolve(true);
    }
    let earlyAccess = new EarlyAccess();
    earlyAccess.email = email;
    earlyAccess.name = name;
    
    await earlyAccessRepository.save(earlyAccess);

    const data = {
      subject: 'Welcome',
      data: {
        'email': earlyAccess.email,
      },
      templateName: 'early-access',
      from: coFounderEmail.value,
      reply: coFounderEmail.value,
      to: earlyAccess.email,
    };


    await this.emailQueue.add(data);

    return Promise.resolve(true);
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