import { Injectable } from '@nestjs/common';
import { Association } from '../../domain/entity/association.entity';
import { Connection } from 'typeorm/connection/Connection';
import { AssociationFileRepository } from '../../dao/association.file.repository';
import { AssociationInfoResponse } from '../../dto/association/association-info.response';
import { WalletRepository } from '../../dao/wallet.repository';
import { BankRepository } from '../../dao/bank.repository';
import { AddressRepository } from '../../dao/address.repository';

@Injectable()
export class AssociationHandler {

  constructor(private readonly connection: Connection) {
  }

  transform(association: Association) {
    const response = new AssociationInfoResponse();
    response.name = association.name;
    response.type = association.type;
    return this.connection.getCustomRepository(AssociationFileRepository)
      .findOne({ association })
      .then(fileType => {
        response.logo = fileType?.file?.servingUrl;
      }).then(_ => {
        return this.connection
          .getCustomRepository(WalletRepository)
          .findOne({
            association,
          }).then(wallet => {
            return this.connection
              .getCustomRepository(BankRepository)
              .findOne({ id: wallet.bank.bankId })
              .then(bank => {
                response.account = {
                  name: 'Fake account',
                  number: wallet.bank.accountNumber,
                };
                response.bank = {
                  name: bank.name,
                  code: bank.code,
                };
              });
          }).then(_ => {
            return this.connection
              .getCustomRepository(AddressRepository)
              .findOne({ id: association.addressId })
              .then(address => {
                response.address = address;
              });
          }).then(_ => Promise.resolve(response));
      });

  }
}
