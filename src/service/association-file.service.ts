import { Inject, Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { FileDto } from '../dto/file.dto';
import { AssociationFileTypeConstant } from '../domain/enums/association-file-type.constant';
import { AssociationFileRepository } from '../dao/association.file.repository';
import { GenericStatusConstant } from '../domain/enums/generic-status-constant';
import { Association } from '../domain/entity/association.entity';
import { FILE_SERVICE, IFileService } from '../contracts/i-file-service';
import { File } from '../domain/entity/file.entity';
import { AssociationFile } from '../domain/entity/association-file.entity';

@Injectable()
export class AssociationFileService {
  constructor(@Inject(FILE_SERVICE) private readonly fileService: IFileService<File>) {
  }

  async createLogo(entityManager: EntityManager, association: Association, fileDto: FileDto) {
    let associationFile = await entityManager
      .getCustomRepository(AssociationFileRepository)
      .findOneByAssociationAndType(association, AssociationFileTypeConstant.LOGO);
    if (associationFile) {
      association.status = GenericStatusConstant.IN_ACTIVE;
      await entityManager.save(associationFile);
    }

    console.log(associationFile);
    let newAssociationFile = new AssociationFile();
    newAssociationFile.file = await this.fileService.upload(entityManager, fileDto);
    newAssociationFile.association = association;
    newAssociationFile.type = AssociationFileTypeConstant.LOGO;
    await entityManager.save(newAssociationFile);
    return associationFile;
  }
}