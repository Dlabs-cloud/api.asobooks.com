import { EarlyAccessRepository as EAccessRepository } from '../dao/early-access.repository';
import { EarlyAccess } from '../domain/entity/early-access.entity';
import { Injectable } from '@nestjs/common';
import { Connection } from 'typeorm';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';
import { EarlyAccessRepository } from 'nestjs-early-access/index';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { Queues } from '../core/cron.enum';
import { EmailQueueDto } from '../dto/email-queue.dto';
import { EarlyAccessDto } from '../dto/early-access.dto';
import { SettingRepository } from '../dao/setting.repository';

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
      //  return Promise.resolve(true);
    }
    let earlyAccess = new EarlyAccess();
    earlyAccess.email = email;
    earlyAccess.name = name;

    return earlyAccessRepository.save(earlyAccess).then(earlyAccess => {

      const data: EmailQueueDto<EarlyAccessDto> = {
        subject: 'Welcome',
        data: {
          'email': earlyAccess.email,
        },
        templateName: 'early-access',
        from: coFounderEmail.value,
        reply: coFounderEmail.value,
        to: earlyAccess.email,
      };

      return this.emailQueue.add(data).then((value => {
        return Promise.resolve(true);
      }));
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