import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';

export const imageFileFilter = (req, file, callback) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return callback(new Error('Only image files are allowed!'), false);
  }
  callback(null, true);
};

export const ImageUploadInterceptor = (fileName: string, maxImageSize: number = 500000) => {
  return FileInterceptor(fileName, {
    fileFilter: imageFileFilter,
    limits: {
      fileSize: maxImageSize,
    },
  });
};

export const generateSavableFileName = (fileName: string): string => {

  const fileExtName = extname(fileName);
  let name = fileName.split(fileExtName)[0];
  name = name.split(/\s/).join('');
  const randomName = Array(7)
    .fill(null)
    .map(() => Math.round(Math.random() * 16).toString(16))
    .join('');
  return `${Date.now()}-${name}-${randomName}${fileExtName}`;
};
