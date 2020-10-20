import { IFileService } from '../contracts/i-file-service';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { FileDto } from '../dto/file.dto';
import { InjectS3, S3 } from 'nestjs-s3';
import { PutObjectRequest } from 'aws-sdk/clients/s3';
import { ConfigService } from '@nestjs/config';
import { EntityManager } from 'typeorm';
import { FileResource } from '../domain/entity/file.entity';


@Injectable()
export class AmazonS3FileService implements IFileService {

  constructor(@InjectS3() private readonly s3: S3,
              private readonly configService: ConfigService) {
  }

  uploadAndPersist(entityManager: EntityManager, fileDto: FileDto): Promise<FileResource> {

    return this.upload(fileDto).then(response => {
      let file = new FileResource();
      file.name = fileDto.name;
      file.contentType = fileDto.contentType;
      file.servingUrl = response.servingUrl;
      file.type = fileDto.fileType;
      file.hostIdentifier = response.hostIdentifier;
      return entityManager.save(file);
    }).catch(reason => {
      throw new HttpException('Cannot upload image at this time', HttpStatus.BAD_GATEWAY);
    });


  }

  async upload(file: FileDto): Promise<{ servingUrl, hostIdentifier }> {
    const region = this.configService.get<string>('AMAZON_REGION', 'eu-west-2');
    const payload: PutObjectRequest = {
      Key: file.name,
      Bucket: this.configService.get('AMAZON_S3_BUCKET', 'socialite.io-dev'),
      ACL: 'public-read',
      ContentType: file.contentType,
      Body: file.data,
    };
    const servingUrl = `https://s3.${region}.amazonaws.com/${payload.Bucket}/${payload.Key}`;
    return this.s3.putObject(payload).promise().then(response => {
      return Promise.resolve({
          servingUrl: servingUrl,
          hostIdentifier: response.ETag,
        },
      );

    });

  }
}