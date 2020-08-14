import { Body, Controller, Put, UploadedFile, UseInterceptors } from '@nestjs/common';
import { AssociationRequestDto } from '../dto/association/association-request.dto';
import { AssociationService } from '../service/association.service';
import { ApiResponseDto } from '../dto/api-response.dto';
import { ImageUploadInterceptor } from '../common/fileutils';
import { RequestPrincipalContext } from '../conf/security/decorators/request-principal.docorator';
import { RequestPrincipal } from '../conf/security/request-principal.service';
import { BaseController } from './BaseController';
import { Some } from 'optional-typescript';
import { FileTypeConstant } from '../domain/enums/file-type-constant';

@Controller('association')
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


    Some(file).ifPresent(fileData => {
      associationRequestDto.logo = this.requestToFile(fileData.buffer, fileData.originalname, fileData.mimetype, FileTypeConstant.IMAGE);
    });
    let association = await this.associationService.createAssociation(associationRequestDto, requestPrincipal);

    return new ApiResponseDto(association, 201);
  }
}