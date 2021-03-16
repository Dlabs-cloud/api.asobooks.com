import { BankInfoDto } from '../dto/bank-info-dto';
import { BankInfo } from '../domain/entity/bank-info.entity';
import { Injectable } from '@nestjs/common';
import { Association } from '../domain/entity/association.entity';
import { Connection, EntityManager } from 'typeorm';
import { BankRepository } from '../dao/bank.repository';
import { threadId } from 'worker_threads';
import { IllegalArgumentException } from '../exception/illegal-argument.exception';
import { BankInfoRepository } from '../dao/bank-info.repository';

@Injectable()
export class BankInfoService {
  constructor(private readonly  connection: Connection) {
  }


  create(entityManager: EntityManager, bankInfo: BankInfoDto) {
    return this.connection
      .getCustomRepository(BankRepository)
      .findOneItemByStatus({ code: bankInfo.code })
      .then(bank => {
        if (!bank) {
          throw new IllegalArgumentException(`Bank with code ${bankInfo.code} is not valid`);
        }
        return this.connection
          .getCustomRepository(BankInfoRepository)
          .findByBankAndAccountNumber(bank, bankInfo.accountNumber)
          .then(existingBankInfo => {
            if (existingBankInfo) {
              return Promise.resolve(existingBankInfo);
            }
            let newBankInfo = new BankInfo();
            newBankInfo.accountNumber = bankInfo.accountNumber;
            newBankInfo.bank = bank;
            return entityManager.save(newBankInfo);
          });
      });


  }
}
