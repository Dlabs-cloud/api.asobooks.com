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
        .findOneItem({ code: associationDto.countryCode });
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
      association.portalAccount = portalAccount;
      if (associationDto.logo) {
        association.logo = await this.fileService.upload(entityManager, associationDto.logo);
      }
      return entityManager.save(association);
    });

  }
}