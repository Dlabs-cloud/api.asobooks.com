import { FileDto } from '../dto/file.dto';
import { FileUploadResponseDto } from '../dto/file-upload.response.dto';
import { BaseEntity } from '../common/base.entity';

export const FILE_SERVICE = 'FILE_SERVICE';

export interface IFileService<SAVEDENTITY extends BaseEntity> {
   upload(entityManager, file: FileDto): Promise<SAVEDENTITY>;
}