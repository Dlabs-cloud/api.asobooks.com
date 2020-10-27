import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidatorTransformPipe } from './conf/validator-transform.pipe';
import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
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
  SwaggerModule.setup('api', app, document);

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
