import { Body, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { AssociationRequestDto } from '../dto/association/association-request.dto';
import { AssociationService } from '../service/association.service';
import { ApiResponseDto } from '../dto/api-response.dto';
import { ImageUploadInterceptor } from '../common/fileutils';
import { RequestPrincipalContext } from '../conf/security/decorators/request-principal.docorator';
import { RequestPrincipal } from '../conf/security/request-principal.service';
import { BaseController } from './BaseController';
import { Some } from 'optional-typescript';
import { FileTypeConstant } from '../domain/enums/file-type-constant';
import { AssociationResponse } from '../dto/association-response';
import { Connection } from 'typeorm';
import { FileRepository } from '../dao/file.repository';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';

@Controller('association')
export class AssociationController extends BaseController {
  constructor(private readonly associationService: AssociationService,
              private readonly connection: Connection) {
    super();
  }

  @UseInterceptors(
    ImageUploadInterceptor('logo'),
  )
  @Post()
  public async createAssociation(@UploadedFile() file,
                                 @Body() associationRequestDto: AssociationRequestDto,
                                 @RequestPrincipalContext() requestPrincipal: RequestPrincipal) {

    Some(file).ifPresent(fileData => {
      associationRequestDto.logo = this.requestToFile(fileData.buffer, fileData.originalname, fileData.mimetype, FileTypeConstant.IMAGE);
    });
    const createdAssociation = await this.associationService.createAssociation(associationRequestDto, requestPrincipal);

    let response: AssociationResponse = {
      id: createdAssociation.id,
    };
    Some(createdAssociation.logo).ifPresent(logo => {
      response.logoServingUrl = logo.servingUrl;
    });

    return new ApiResponseDto(response, 201);
  }
}