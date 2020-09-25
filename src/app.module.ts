import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DomainModule } from './domain/domain.module';
import { DaoModule } from './dao/dao.module';
import { ConfModule } from './conf/conf.module';
import { CommonModule } from './common/common.module';
import { CoreModule } from './core/core.module';
import { ServiceModule } from './service/service.module';
import { ControllerModule } from './controller/controller.module';
import { ConfigModule } from '@nestjs/config';
import { HandlerModule } from './handler/handler.module';
import { EarlyAccessService } from './service/early-access.service';
import {EarlyAccessModule} from "nestjs-early-access/dist/early-access.module";

@Module({
  imports: [
    EarlyAccessModule.registerAsync({
      inject: [EarlyAccessService],
      imports: [ServiceModule],
      useFactory: (earlyAccessService: EarlyAccessService) => {
        return {
          repository: earlyAccessService,
          enabled: true,
          url: '/',
          template: {
            viewDir: `${process.cwd()}/views`,
            assetsDir: `${process.cwd()}/assets`,
            index: 'index',
          },
        };
      },
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [ConfModule.environment + '.env'],
    }),
    DomainModule,
    DaoModule,
    ConfModule,
    CommonModule,
    CoreModule,
    ServiceModule,
    HandlerModule,
    ControllerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
}
