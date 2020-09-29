import { NestFactory } from '@nestjs/core';
import { WorkerModule } from './worker/worker.module';

async function bootstrap() {
  const app = await NestFactory.create(WorkerModule);
  app.setGlobalPrefix(`api/v${process.env.VERSION}`);

  let port = process.env.HOST_PORT || process.env.WORKER_PORT || 5656;
  app.listen(port).then(() => {
    console.log(`Starting application on port ${port}`);
    console.log(`Url:: ${process.env.DOMAIN}:${port}/api/v${process.env.VERSION}`);
  });
}

bootstrap();
