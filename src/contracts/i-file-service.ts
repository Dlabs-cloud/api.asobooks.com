import { FileDto } from '../dto/file.dto';
import { FileUploadResponseDto } from '../dto/file-upload.response.dto';
import { BaseEntity } from '../common/base.entity';
import { EntityManager } from 'typeorm';

export const FILE_SERVICE = 'FILE_SERVICE';

export interface IFileService {
  uploadAndPersist(entityManager, file: FileDto);

  upload(file: FileDto): Promise<FileUploadResponseDto>;

  save(entityManager: EntityManager, uploadResponse: FileUploadResponseDto);

}