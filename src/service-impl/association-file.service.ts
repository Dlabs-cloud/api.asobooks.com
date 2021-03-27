import { Inject, Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { FileDto } from '../dto/file.dto';
import { AssociationFileTypeConstant } from '../domain/enums/association-file-type.constant';
import { AssociationFileRepository } from '../dao/association.file.repository';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';
import { Association } from '../domain/entity/association.entity';
import { FILE_SERVICE, IFileService } from '../contracts/i-file-service';
import { FileResource } from '../domain/entity/file.entity';
import { AssociationFile } from '../domain/entity/association-file.entity';
import { FileUploadResponseDto } from '../dto/file-upload.response.dto';

@Injectable()
export class AssociationFileService {
  constructor(@Inject(FILE_SERVICE) private readonly fileService: IFileService) {
  }


  async createLogo(entityManager: EntityManager, association: Association, fileDto: FileDto) {
    let associationFile = await entityManager
      .getCustomRepository(AssociationFileRepository)
      .findOneByAssociationAndType(association, AssociationFileTypeConstant.LOGO);
    if (associationFile) {
      associationFile.status = GenericStatusConstant.IN_ACTIVE;
      await entityManager.save(associationFile);
    }
    associationFile = new AssociationFile();
    associationFile.file = await this.fileService.uploadAndPersist(entityManager, fileDto);
    associationFile.association = association;
    associationFile.type = AssociationFileTypeConstant.LOGO;
    await entityManager.save(associationFile);
    return associationFile;
  }
}
