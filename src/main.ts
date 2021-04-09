import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidatorTransformPipe } from './conf/validator-transform.pipe';
import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';
import { Log } from './conf/logger/Logger';
import * as Sentry from '@sentry/node';
import * as Tracing from '@sentry/tracing';
import { RemoteLoggerInterceptor } from './dlabs-nest-starter/logger/remote-logger.interceptor';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: false,
  });
  const express = app.getHttpServer();
  const configService = app.get<ConfigService>(ConfigService);
  const dsn = configService.get<string>('SENTRY_DSN', null);
  console.log(dsn);
  Sentry.init({
    dsn,
    integrations: [
      // enable HTTP calls tracing
      new Sentry.Integrations.Http({ tracing: true }),
      // enable Express.js middleware tracing
      new Tracing.Integrations.Express({ app: express }),
    ],
    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,
  });
//   app.use(Sentry.Handlers.requestHandler());
// // TracingHandler creates a trace for every incoming request
//   app.use(Sentry.Handlers.tracingHandler());
  app.useGlobalInterceptors(new RemoteLoggerInterceptor(new Log(), {
    ip: true,
    request: true,
  }));
  app.useLogger(new Log());
  app.setGlobalPrefix(`api/v${process.env.VERSION}`);
  globalPipes(app);


  const options = new DocumentBuilder()
    .setTitle('Aso Books Api')
    .setDescription('Api for Aso Books')
    .setVersion('1.0')
    .addTag('Asobooks')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options);
  fs.writeFileSync('./swagger-spec.json', JSON.stringify(document));
  SwaggerModule.setup(`api/v${process.env.VERSION}/docs`, app, document);

  let port = process.env.HOST_PORT || process.env.PORT || 3000;
  app.listen(port).then(() => {
    console.log(`Starting application on port ${port}`);
    console.log(`Url:: ${process.env.DOMAIN}:${port}/api/v${process.env.VERSION}`);
  });
}

export function globalPipes(app: INestApplication) {
  app.useGlobalPipes(new ValidatorTransformPipe());
}

bootstrap();
