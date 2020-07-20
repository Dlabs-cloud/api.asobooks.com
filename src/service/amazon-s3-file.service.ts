import { IFileService } from '../contracts/i-file-service';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { FileDto } from '../dto/file.dto';
import { InjectS3, S3 } from 'nestjs-s3';
import { PutObjectRequest } from 'aws-sdk/clients/s3';
import { ConfigService } from '@nestjs/config';
import { EntityManager } from 'typeorm';
import { File } from '../domain/entity/file.entity';


@Injectable()
export class AmazonS3FileService implements IFileService<File> {

  constructor(@InjectS3() private readonly s3: S3,
              private readonly configService: ConfigService) {
  }

  async upload(entityManager: EntityManager, fileDto: FileDto): Promise<File> {
    const region = this.configService.get<string>('AMAZON_REGION', 'eu-west-2');
    const payload: PutObjectRequest = {
      Key: fileDto.name,
      Bucket: this.configService.get('AMAZON_S3_BUCKET', 'socialite.io-dev'),
      ACL: 'public-read',
      ContentType: fileDto.contentType,
      Body: fileDto.data,
    };
    const servingUrl = `https://s3.${region}.amazonaws.com/${payload.Bucket}/${payload.Key}`;

    try {
      const response = await this.s3.putObject(payload).promise();
      const file = new File();
      file.name = fileDto.name;
      file.contentType = fileDto.contentType;
      file.servingUrl = servingUrl;
      file.type = fileDto.fileType;
      file.hostIdentifier = response.ETag;
      return entityManager.save(file);
    } catch (e) {
      throw new HttpException('Cannot upload image at this time', HttpStatus.BAD_GATEWAY);
    }

  }

}