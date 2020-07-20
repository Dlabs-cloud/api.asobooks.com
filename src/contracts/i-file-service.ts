import { FileDto } from '../dto/file.dto';
import { FileUploadResponse } from '../dto/file-upload.response';
import { BaseEntity } from '../common/base.entity';

export const FILE_SERVICE = 'FILE_SERVICE';

export interface IFileService<SAVEDENTITY extends BaseEntity> {
   upload(entityManager, file: FileDto): Promise<SAVEDENTITY>;
}