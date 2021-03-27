import { Injectable } from '@nestjs/common';
import { AssociationRequestDto } from '../dto/association/association-request.dto';
import { Connection } from 'typeorm';
import { AddressRepository } from '../dao/address.repository';
import { AddressDto } from '../dto/address.dto';
import { CountryRepository } from '../dao/country.repository';
import { RequestPrincipal } from '../dlabs-nest-starter/security/request-principal.service';
import { PortalAccountRepository } from '../dao/portal-account.repository';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';
import { AssociationRepository } from '../dao/association.repository';
import { BankInfoService } from './bank-info.service';
import { BankInfoDto } from '../dto/bank-info-dto';
import { AssociationFileService } from './association-file.service';
import { IllegalArgumentException } from '../exception/illegal-argument.exception';
import { MembershipService } from './membership.service';
import { BankInfoRepository } from '../dao/bank-info.repository';
import { BankRepository } from '../dao/bank.repository';
import { GroupService } from './group.service';
import { GroupDto } from '../dto/group.dto';
import { GroupTypeConstant } from '../domain/enums/group-type.constant';
import { AssociationService } from '../service/association-service';
import { Association } from '../domain/entity/association.entity';
import { FileUploadResponseDto } from '../dto/file-upload.response.dto';
import { WalletService } from './wallet.service';
import { PortalAccountService } from './portal-account.service';
import { PortalAccountDto } from '../dto/portal-account.dto';
import { PortalAccountTypeConstant } from '../domain/enums/portal-account-type-constant';
import { UpdateAssociationDto } from 'src/dto/update-association.dto';
import { WalletRepository } from '../dao/wallet.repository';
import { retry } from 'rxjs/operators';
import { FileDto } from '../dto/file.dto';


@Injectable()
export class AssociationServiceImpl implements AssociationService {

  constructor(private readonly connection: Connection,
              private readonly bankInfoService: BankInfoService,
              private readonly membershipService: MembershipService,
              private readonly groupService: GroupService,
              private readonly walletService: WalletService,
              private readonly portalAccountService: PortalAccountService,
              private readonly associationFileService: AssociationFileService) {
  }

  updateAssociation(association: Association, updateInfo: UpdateAssociationDto): Promise<Association> {
    return this.connection.transaction(async entityManager => {
      if (updateInfo.name) {
        association.name = updateInfo.name;
      }

      if (updateInfo.type) {
        association.type = updateInfo.type;
      }

      if (updateInfo.address) {
        const addressDto = new AddressDto();
        addressDto.name = updateInfo.address.address;
        addressDto.country = await entityManager.getCustomRepository(CountryRepository)
          .findOneItemByStatus({ code: updateInfo.address.countryCode });
        association.address = await entityManager
          .getCustomRepository(AddressRepository)
          .saveAddress(entityManager, addressDto);
      }

      if (updateInfo.logo) {
        await this
          .associationFileService
          .createLogo(entityManager, association, updateInfo.logo as FileDto);
      }

      if (updateInfo.bankInfo) {
        await this.bankInfoService
          .create(entityManager, updateInfo.bankInfo)
          .then(bankInfo => {
            return this.connection
              .getCustomRepository(WalletRepository)
              .findByAssociation(association)
              .then(wallet => {
                if (!wallet) {
                  throw new Error('Wallet was not created for association');
                }
                wallet.bank = bankInfo;
                return entityManager.save(wallet);
              });
          });
      }

      return entityManager.save(association);
    });
  }


  createAssociation(associationDto: AssociationRequestDto, requestPrincipal: RequestPrincipal): Promise<Association> {
    return this.connection.transaction(async entityManager => {

      const portalAccount = await entityManager
        .getCustomRepository(PortalAccountRepository)
        .findFirstByPortalUserAndStatus(requestPrincipal.portalUser, true);
      let association = await entityManager.getCustomRepository(AssociationRepository)
        .findByPortalAccount(portalAccount, GenericStatusConstant.PENDING_ACTIVATION);

      if (!association) {
        throw new IllegalArgumentException('Association does not exist');
      }

      if (associationDto.name) {
        association.name = associationDto.name;
      }


      if (associationDto.logo) {
        let fileUploadResponseDto = associationDto.logo as FileDto;
        await this.associationFileService.createLogo(entityManager, association, fileUploadResponseDto);
      }


      association.type = associationDto.type;

      const addressDto = new AddressDto();
      addressDto.name = associationDto.address.address;
      addressDto.country = await entityManager.getCustomRepository(CountryRepository)
        .findOneItemByStatus({ code: associationDto.address.countryCode });
      addressDto.unit = associationDto.address.unit;
      association.address = await entityManager
        .getCustomRepository(AddressRepository)
        .saveAddress(entityManager, addressDto);

      let bankInfo = null;


      const bankInfoDto = associationDto.bankInfo;
      if (bankInfoDto) {
        let bankInfoData: BankInfoDto = {
          accountNumber: bankInfoDto.accountNumber,
          code: bankInfoDto.code,
        };

        bankInfo = await entityManager
          .getCustomRepository(BankInfoRepository)
          .findOneItemByStatus({ accountNumber: bankInfoDto.accountNumber });
        if (bankInfo) {
          bankInfo.status = GenericStatusConstant.ACTIVE;
          bankInfo.accountNumber = bankInfoData.accountNumber;
          bankInfo.bank = await this.connection
            .getCustomRepository(BankRepository)
            .findOneItemByStatus({ code: bankInfoData.code });
          bankInfo = await entityManager.save(bankInfo);
        } else {
          bankInfo = await this.bankInfoService.create(entityManager, bankInfoData);
        }
      }

      await this.walletService.createAssociationWallet(entityManager, association, bankInfo);

      association.status = GenericStatusConstant.ACTIVE;
      const group: GroupDto = {
        association: association,
        name: `${association.name.toLowerCase()} general group`,
        type: GroupTypeConstant.GENERAL,
      };
      let portalAccountService: PortalAccountDto = {
        association: association,
        name: `${association.name} Membership Account`,
        type: PortalAccountTypeConstant.MEMBER_ACCOUNT,
      };
      await this.portalAccountService.createPortalAccount(entityManager, portalAccountService, GenericStatusConstant.ACTIVE);
      await this.groupService.createGroup(entityManager, group);

      return entityManager.save(association);
    });

  }
}
