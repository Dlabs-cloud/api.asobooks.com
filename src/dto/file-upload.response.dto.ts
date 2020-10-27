import { FileTypeConstant } from '../domain/enums/file-type-constant';

export class FileUploadResponseDto {
  hostIdentifier: string;
  servingUrl: string;
  name: string;
  contentType: string;
  fileType: FileTypeConstant;
}