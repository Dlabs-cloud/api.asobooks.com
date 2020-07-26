import { BankInfoDto } from '../dto/bank-info-dto';
import { BankInfo } from '../domain/entity/bank-info.entity';
import { Injectable } from '@nestjs/common';
import { Association } from '../domain/entity/association.entity';
import { Connection, EntityManager } from 'typeorm';
import { BankRepository } from '../dao/bank.repository';

@Injectable()
export class BankInfoService {
  constructor(private readonly  connection: Connection) {
  }

  async create(entityManager: EntityManager, bankInfo: BankInfoDto, association: Association): Promise<BankInfo> {
    let newBankInfo = new BankInfo();
    newBankInfo.accountNumber = bankInfo.accountNumber;
    newBankInfo.association = association;
    newBankInfo.bank = await this.connection
      .getCustomRepository(BankRepository)
      .findOneItemByStatus({ code: bankInfo.bankCode });
    return entityManager.save(newBankInfo);
  }
}