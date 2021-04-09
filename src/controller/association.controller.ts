import { Body, Controller, Get, Inject, Patch, Put, UploadedFile, UseInterceptors } from '@nestjs/common';
import { AssociationRequestDto } from '../dto/association/association-request.dto';
import { AssociationServiceImpl } from '../service-impl/association.service-impl';
import { ApiResponseDto } from '../dto/api-response.dto';
import { ImageUploadInterceptor } from '../common/fileutils';
import { RequestPrincipalContext } from '../dlabs-nest-starter/security/decorators/request-principal.docorator';
import { RequestPrincipal } from '../dlabs-nest-starter/security/request-principal.service';
import { BaseController } from './BaseController';
import { FileTypeConstant } from '../domain/enums/file-type-constant';
import { ASSOCIATION_SERVICE, AssociationService } from '../service/association-service';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { AssociationOnboardingDto } from '../dto/association-onboarding.dto';
import { UpdateAssociationDto } from '../dto/update-association.dto';
import { AssociationContext } from '../dlabs-nest-starter/security/annotations/association-context';
import { AssociationHandler } from './handlers/association.handler';
import { Log } from '../conf/logger/Logger';

@Controller('associations')
export class AssociationController extends BaseController {
  constructor(@Inject(ASSOCIATION_SERVICE) private readonly associationService: AssociationService,
              private readonly log: Log,
              private readonly associationHandler: AssociationHandler) {
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

  @Get()
  @AssociationContext()
  public async getAssociation(@RequestPrincipalContext() requestPrincipal: RequestPrincipal) {
    return this
      .associationHandler
      .transform(requestPrincipal.association)
      .then(response => new ApiResponseDto(response));
  }


  @UseInterceptors(
    ImageUploadInterceptor('logo'),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Update Association',
    type: UpdateAssociationDto,
  })
  @Patch()
  @AssociationContext()
  public update(@UploadedFile() file,
                @RequestPrincipalContext() requestPrincipal: RequestPrincipal,
                @Body() request: UpdateAssociationDto) {


    try {
      if (file) {
        request.logo = this.requestToFile(file.buffer, file.originalname, file.mimetype, FileTypeConstant.IMAGE);
      }

      return this.associationService
        .updateAssociation(requestPrincipal.association, request)
        .then(association => {
          return Promise.resolve(new ApiResponseDto(null, 204));
        });

    } catch (e) {
      this.log.error(e)
      throw e;
    }

  }
}
