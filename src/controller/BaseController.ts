import { FileDto } from '../dto/file.dto';
import { generateSavableFileName } from '../common/fileutils';
import { FileTypeConstant } from '../domain/enums/file-type-constant';
import { Controller } from '@nestjs/common';

export class BaseController {

  requestToFile(buffer: string, fileName, contentType, fileType: FileTypeConstant): FileDto {
    return {
      data: Buffer.from(buffer, 'binary'),
      contentType: contentType,
      name: generateSavableFileName(fileName),
      fileType: fileType,
    };
  }
}