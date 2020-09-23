import { Injectable } from '@nestjs/common';
import { AssociationRequestDto } from '../dto/association/association-request.dto';
import { Connection } from 'typeorm';
import { AddressRepository } from '../dao/address.repository';
import { AddressDto } from '../dto/address.dto';
import { CountryRepository } from '../dao/country.repository';
import { RequestPrincipal } from '../conf/security/request-principal.service';
import { PortalAccountRepository } from '../dao/portal-account.repository';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';
import { AssociationRepository } from '../dao/association.repository';
import { Some } from 'optional-typescript';
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


@Injectable()
export class AssociationService {

  constructor(private readonly connection: Connection,
              private readonly bankInfoService: BankInfoService,
              private readonly membershipService: MembershipService,
              private readonly groupService: GroupService,
              private readonly associationFileService: AssociationFileService) {
  }

  createAssociation(associationDto: AssociationRequestDto, requestPrincipal: RequestPrincipal) {
    return this.connection.transaction(async entityManager => {

      associationDto.activateAssociation = associationDto.activateAssociation ?? false;

      const portalAccount = await entityManager
        .getCustomRepository(PortalAccountRepository)
        .findFirstByPortalUserAndStatus(requestPrincipal.portalUser, true);
      let association = await entityManager.getCustomRepository(AssociationRepository)
        .findByPortalAccount(portalAccount, GenericStatusConstant.PENDING_ACTIVATION);

      if (!association) {
        throw new IllegalArgumentException('Association does not exist');
      }
      Some(associationDto.name).ifPresent(associationName => {
        association.name = associationDto.name;
      });

      if (associationDto.address) {
        const addressDto = new AddressDto();
        addressDto.name = associationDto.address.address;
        addressDto.country = await entityManager.getCustomRepository(CountryRepository)
          .findOneItemByStatus({ code: associationDto.address.countryCode });
        association.address = await entityManager
          .getCustomRepository(AddressRepository)
          .saveAddress(entityManager, addressDto);
      }

      Some(associationDto.type).ifPresent(type => {
        association.type = type;
      });


      if (true === (association.name && association.type && associationDto.activateAssociation)) {
        association.status = GenericStatusConstant.ACTIVE;
        const group: GroupDto = {
          association: association,
          name: `${association.name.toLowerCase()} general group`,
          type: GroupTypeConstant.GENERAL,

        };
        await this.groupService.createGroup(entityManager, group);

      } else {
        association.status = GenericStatusConstant.PENDING_ACTIVATION;
      }


      if (associationDto.bankInfo) {
        let bankInfoData: BankInfoDto = {
          accountNumber: associationDto.bankInfo.accountNumber,
          bankCode: associationDto.bankInfo.bankCode,
        };


        let bankInfo = await entityManager
          .getCustomRepository(BankInfoRepository)
          .findOneByAssociation(association, GenericStatusConstant.ACTIVE);
        if (bankInfo) {
          bankInfo.status = GenericStatusConstant.ACTIVE;
          bankInfo.accountNumber = bankInfoData.accountNumber;
          bankInfo.bank = await this.connection
            .getCustomRepository(BankRepository)
            .findOneItemByStatus({ code: bankInfoData.bankCode });
          await entityManager.save(bankInfo);
        } else {
          await this.bankInfoService.create(entityManager, bankInfoData, association);
        }

      }

      await entityManager.save(association);
      if (associationDto.logo) {
        await this.associationFileService.createLogo(entityManager, association, associationDto.logo);
      }
      return association;

    });

  }
}