import { Inject, Injectable } from '@nestjs/common';
import { AssociationRequestDto } from '../dto/association/association-request.dto';
import { Association } from '../domain/entity/association.entity';
import { Connection } from 'typeorm';
import { AddressRepository } from '../dao/address.repository';
import { AddressDto } from '../dto/address.dto';
import { CountryRepository } from '../dao/country.repository';
import { RequestPrincipal } from '../conf/security/request-principal.service';
import { PortalAccountRepository } from '../dao/portal-account.repository';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';
import { FILE_SERVICE, IFileService } from '../contracts/i-file-service';
import { File } from '../domain/entity/file.entity';
import { AssociationRepository } from '../dao/association.repository';
import { Some } from 'optional-typescript';
import { BankInfoService } from './bank-info.service';
import { BankInfoDto } from '../dto/bank-info-dto';
import { AssociationFileService } from './association-file.service';
import { threadId } from 'worker_threads';
import { IllegalArgumentException } from '../exception/illegal-argument.exception';


@Injectable()
export class AssociationService {

  constructor(private readonly connection: Connection,
              private readonly bankInfoService: BankInfoService,
              private readonly associationFileService: AssociationFileService) {
  }

  createAssociation(associationDto: AssociationRequestDto, requestPrincipal: RequestPrincipal) {
    return this.connection.transaction(async entityManager => {
      const addressDto = new AddressDto();
      addressDto.name = associationDto.address;
      addressDto.country = await entityManager.getCustomRepository(CountryRepository)
        .findOneItemByStatus({ code: associationDto.countryCode });
      const address = await entityManager
        .getCustomRepository(AddressRepository)
        .saveAddress(entityManager, addressDto);
      const portalAccount = await entityManager
        .getCustomRepository(PortalAccountRepository)
        .findFirstByPortalUserAndStatus(requestPrincipal.portalUser, true);
      let association = await entityManager.getCustomRepository(AssociationRepository)
        .findByPortalAccount(portalAccount, GenericStatusConstant.PENDING_ACTIVATION);
      if (!association) {
        throw new IllegalArgumentException('Association was not  created for account');
      }
      association.name = associationDto.name;
      association.address = address;
      association.type = associationDto.type;

      if (association.name && association.type && associationDto.activateAssociation) {
        association.status = GenericStatusConstant.ACTIVE;
      } else {
        association.status = GenericStatusConstant.PENDING_ACTIVATION;
      }

      await entityManager.save(association);

      if (associationDto.bankCode && associationDto.accountNumber) {
        let bankInfo: BankInfoDto = {
          accountNumber: associationDto.bankCode,
          bankCode: associationDto.accountNumber,
        };
        await this.bankInfoService.create(entityManager, bankInfo, association);
      }
      if (associationDto.logo) {
        await this.associationFileService.createLogo(entityManager, association, associationDto.logo);
      }
      return association;

    });

  }
}