import { Body, Controller, Get, Inject, Put, UploadedFile, UseInterceptors } from '@nestjs/common';
import { AssociationRequestDto } from '../dto/association/association-request.dto';
import { AssociationServiceImpl } from '../service-impl/association.service-impl';
import { ApiResponseDto } from '../dto/api-response.dto';
import { ImageUploadInterceptor } from '../common/fileutils';
import { RequestPrincipalContext } from '../dlabs-nest-starter/security/decorators/request-principal.docorator';
import { RequestPrincipal } from '../dlabs-nest-starter/security/request-principal.service';
import { BaseController } from './BaseController';
import { FileTypeConstant } from '../domain/enums/file-type-constant';
import { ASSOCIATION_SERVICE, AssociationService, CACHE_ASSOCIATION_SERVICE } from '../service/association-service';
import { CacheService } from '../common/utils/cache.service';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { AssociationOnboardingDto } from '../dto/association-onboarding.dto';
import { Public } from '../dlabs-nest-starter/security/annotations/public';

@Controller('associations')
export class AssociationController extends BaseController {
  constructor(@Inject(ASSOCIATION_SERVICE) private readonly associationService: AssociationService,
              private readonly cacheService: CacheService) {
    super();
  }

  @UseInterceptors(
    ImageUploadInterceptor('logo'),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Onboard associations',
    type: AssociationOnboardingDto,
  })
  @Put('/onboard')
  public async createAssociation(@UploadedFile() file,
                                 @Body() associationRequestDto: AssociationRequestDto,
                                 @RequestPrincipalContext() requestPrincipal: RequestPrincipal) {


    if (file) {
      associationRequestDto.logo = this.requestToFile(file.buffer, file.originalname, file.mimetype, FileTypeConstant.IMAGE);
    }

    let association = await this.associationService.createAssociation(associationRequestDto, requestPrincipal);
    return new ApiResponseDto(association, 201);
  }

  @Get('/onboard')
  public async getOnBoardingAssociation(@RequestPrincipalContext() requestPrincipal: RequestPrincipal) {
    const key = `onboarding:${requestPrincipal.portalUser.email}-association-onboarding`;
    return this.cacheService.get(key).then(value => {
      return Promise.resolve(new ApiResponseDto(value));
    });
  }
}