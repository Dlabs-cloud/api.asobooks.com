import { ASSOCIATION_SERVICE, AssociationService } from '../service/association-service';
import { AssociationRequestDto } from '../dto/association/association-request.dto';
import { RequestPrincipal } from '../dlabs-nest-starter/security/request-principal.service';
import { CacheService } from '../common/utils/cache.service';
import { FILE_SERVICE, IFileService } from '../contracts/i-file-service';
import { Inject } from '@nestjs/common';
import { AssociationOnboardingDto } from '../dto/association-onboarding.dto';
import { FileDto } from '../dto/file.dto';
import { Association } from '../domain/entity/association.entity';
import { UpdateAssociationDto } from '../dto/update-association.dto';


export class CachedAssociationServiceImpl implements AssociationService {

  constructor(private readonly cacheService: CacheService,
              @Inject(ASSOCIATION_SERVICE) private readonly associationService: AssociationService,
              @Inject(FILE_SERVICE) private readonly fileService: IFileService) {
  }

  async createAssociation(associationDto: AssociationRequestDto, requestPrincipal: RequestPrincipal) {
    // associationDto.activateAssociation = associationDto.activateAssociation === 'true';
    //
    //   const key = `onboarding:${requestPrincipal.portalUser.email}-association-onboarding`;
    //   let existingData = (await this.cacheService.get(key)) as AssociationOnboardingDto;
    //   if (existingData) {
    //     Object.keys(existingData).forEach(key => {
    //       if (associationDto[key]) {
    //         existingData[key] = associationDto[key];
    //       }
    //     });
    //   } else {
    //     existingData = associationDto;
    //   }
    //
    //   if (associationDto.logo) {
    //     existingData.logo = await this.fileService.upload(associationDto.logo as FileDto);
    //   }
    //   return this.cacheService.set(key, existingData).then(value => {
    //     return Promise.resolve(existingData);
    //   }).then(existingData => {
    //     if (existingData.name && existingData.type && associationDto.activateAssociation) {
    //       return this.associationService.createAssociation(existingData, requestPrincipal).then(association => {
    //         return this.cacheService.del(key).then(del => {
    //           return Promise.resolve(existingData);
    //         });
    //       });
    //     }
    //     return Promise.resolve(existingData);
    //   }).catch(error => {
    //     console.log(error);
    //   });
  }

  updateAssociation(association: Association, updateInfo: UpdateAssociationDto): Promise<Association> {
    return Promise.resolve(undefined);
  }

}
