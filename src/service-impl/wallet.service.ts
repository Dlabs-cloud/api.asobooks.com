import { Association } from '../domain/entity/association.entity';
import { EntityManager } from 'typeorm';
import { BankInfoDto } from '../dto/bank-info-dto';
import { Wallet } from '../domain/entity/wallet.entity';
import { BankInfoRepository } from '../dao/bank-info.repository';
import { BankInfo } from '../domain/entity/bank-info.entity';
import { BankInfoService } from './bank-info.service';
import { WalletSequence } from '../core/sequenceGenerators/wallet.sequence';
import { Injectable } from '@nestjs/common';

@Injectable()
export class WalletService {

  constructor(private readonly walletSequence: WalletSequence) {
  }


  createAssociationWallet(entityManager: EntityManager, association: Association, bankInfo: BankInfo) {
    return this.walletSequence.next().then(reference => {
      let wallet = new Wallet();
      wallet.association = association;
      wallet.availableBalance = 0;
      wallet.bookBalance = 0;
      wallet.bank = bankInfo;
      wallet.reference = reference;
      return entityManager.save(wallet);
    });


  }
}