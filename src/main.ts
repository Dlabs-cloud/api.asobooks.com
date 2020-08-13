import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidatorTransformPipe } from './conf/validator-transform.pipe';
import { INestApplication } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix(`api/v${process.env.VERSION}`);
  globalPipes(app);


  app.listen(process.env.HOST_PORT).then(() => {
    console.log(`Starting application on port ${process.env.HOST_PORT}`);
    console.log(`Url:: ${process.env.DOMAIN}:${process.env.HOST_PORT}/api/v${process.env.VERSION}`);
  });
}

export function globalPipes(app: INestApplication) {
  app.useGlobalPipes(new ValidatorTransformPipe());
}

bootstrap();
