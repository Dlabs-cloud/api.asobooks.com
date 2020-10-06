import { Body, Controller, Put, UploadedFile, UseInterceptors } from '@nestjs/common';
import { AssociationRequestDto } from '../dto/association/association-request.dto';
import { AssociationService } from '../service/association.service';
import { ApiResponseDto } from '../dto/api-response.dto';
import { ImageUploadInterceptor } from '../common/fileutils';
import { RequestPrincipalContext } from '../dlabs-nest-starter/security/decorators/request-principal.docorator';
import { RequestPrincipal } from '../dlabs-nest-starter/security/request-principal.service';
import { BaseController } from './BaseController';
import { FileTypeConstant } from '../domain/enums/file-type-constant';

@Controller('associations')
export class AssociationController extends BaseController {
  constructor(private readonly associationService: AssociationService) {
    super();
  }

  @UseInterceptors(
    ImageUploadInterceptor('logo'),
  )
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
}