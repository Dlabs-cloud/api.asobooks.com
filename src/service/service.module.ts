import { forwardRef, Module } from '@nestjs/common';
import { ASSOCIATION_SERVICE, CACHE_ASSOCIATION_SERVICE } from './association-service';
import { AssociationServiceImpl } from '../service-impl/association.service-impl';
import { CachedAssociationServiceImpl } from '../service-impl/cached-association.service-impl';
import { CommonModule } from '../common/common.module';
import { ServiceImplModule } from '../service-impl/service-Impl.module';
import { ValidationService } from '../service-impl/validation-service';
import { BEARER_TOKEN_SERVICE } from '../dlabs-nest-starter/interfaces/i-bearer-token-service';
import { BearerTokenService } from '../service-impl/bearer-token.service';
import { FILE_SERVICE } from '../contracts/i-file-service';
import { AmazonS3FileService } from '../service-impl/amazon-s3-file.service';
import { ConfigModule } from '@nestjs/config';

const associationService = {
  provide: ASSOCIATION_SERVICE,
  useClass: AssociationServiceImpl,
};

const cachedAssociationService = {
  provide: CACHE_ASSOCIATION_SERVICE,
  useClass: CachedAssociationServiceImpl,
};

const emailValidationProvider = {
  provide: 'EMAIL_VALIDATION_SERVICE',
  useClass: ValidationService,
};

const bearerTokenServiceProvider = {
  provide: BEARER_TOKEN_SERVICE,
  useClass: BearerTokenService,
};

const fileServiceProvider = {
  provide: FILE_SERVICE,
  useClass: AmazonS3FileService,
};

@Module({
  imports: [CommonModule, forwardRef(() => ServiceImplModule), ConfigModule],
  exports: [cachedAssociationService,
    associationService,
    emailValidationProvider,
    fileServiceProvider,
    bearerTokenServiceProvider,
  ],
  providers: [cachedAssociationService,
    associationService,
    emailValidationProvider,
    fileServiceProvider,
    bearerTokenServiceProvider],
})
export class ServiceModule {
}
