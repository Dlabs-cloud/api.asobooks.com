import { FileTypeConstant } from '../domain/enums/file-type-constant';

export class FileDto {
  data: Buffer;
  name: string;
  contentType: string;
  fileType: FileTypeConstant;
  
}