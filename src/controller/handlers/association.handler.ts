import { Injectable } from '@nestjs/common';
import { Association } from '../../domain/entity/association.entity';
import { Connection } from 'typeorm/connection/Connection';
import { AssociationFileRepository } from '../../dao/association.file.repository';
import { AssociationInfoResponse } from '../../dto/association/association-info.response';
import { WalletRepository } from '../../dao/wallet.repository';
import { BankRepository } from '../../dao/bank.repository';
import { AddressRepository } from '../../dao/address.repository';
import { BankInfo } from '../../domain/entity/bank-info.entity';
import { AccountDetailRepository } from '../../dao/account-detail.repository';
import { GenericStatusConstant } from '../../domain/enums/generic-status-constant';
import { AssociationFileTypeConstant } from '../../domain/enums/association-file-type.constant';

@Injectable()
export class AssociationHandler {

  constructor(private readonly connection: Connection) {
  }

  transform(association: Association) {
    const response = new AssociationInfoResponse();
    response.name = association.name;
    response.type = association.type;
    return this.connection.getCustomRepository(AssociationFileRepository)
      .findOne({ association, status: GenericStatusConstant.ACTIVE, type: AssociationFileTypeConstant.LOGO })
      .then(fileType => {
        response.logo = fileType?.file?.servingUrl;
      }).then(_ => {
        return this.connection
          .getCustomRepository(WalletRepository)
          .findOne({
            association,
          }, {
            relations: [
              'bank',
              'bank.bank',
            ],
          }).then(wallet => {
            const bankInfo: BankInfo = wallet.bank;
            return this.connection.getCustomRepository(AccountDetailRepository)
              .findOne({
                number: bankInfo.accountNumber,
              }).then(accountDetails => {
                response.account = {
                  name: accountDetails?.name,
                  number: bankInfo?.accountNumber,
                };
                response.bank = {
                  name: bankInfo?.bank.name,
                  code: bankInfo?.bank.code,
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
