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
import { BankRepository } from '../dao/bank.repository';
import { AssociationFileRepository } from '../dao/association.file.repository';
import { AssociationFileTypeConstant } from '../domain/enums/association-file-type.constant';
import { AssociationFile } from '../domain/entity/association.file';
import { IllegalArgumentException } from '../exception/illegal-argument.exception';


@Injectable()
export class AssociationService {

  constructor(private readonly connection: Connection,
              @Inject(FILE_SERVICE) private readonly fileService: IFileService<File>) {
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
      association = Some(association).valueOr(new Association());
      association.name = associationDto.name;
      association.address = address;
      association.type = associationDto.type;
      if (associationDto.bankCode && associationDto.accountNumber) {
        association.bank = await this.connection
          .getCustomRepository(BankRepository)
          .findByCode(associationDto.bankCode);
        association.accountNumber = associationDto.accountNumber;
      }
      await entityManager.save(association);

      if (!association.name && !association.type) {
        throw new IllegalArgumentException('Association must always have name and type');
      }

      if (association.name && association.type && associationDto.activateAssociation) {
        association.status = GenericStatusConstant.ACTIVE;
      }

      await entityManager.save(association);

      if (associationDto.logo) {
        let associationFile = await this.connection
          .getCustomRepository(AssociationFileRepository)
          .findOneByAssociationAndCode(association, AssociationFileTypeConstant.LOGO);
        if (associationFile) {
          association.status = GenericStatusConstant.IN_ACTIVE;
          await entityManager.save(associationFile);
        } else {
          let newAssociationFile = new AssociationFile();
          newAssociationFile.file = await this.fileService.upload(entityManager, associationDto.logo);
          newAssociationFile.association = association;
          newAssociationFile.type = AssociationFileTypeConstant.LOGO;
          await entityManager.save(newAssociationFile);
        }
      }

      return association;

    });

  }
}