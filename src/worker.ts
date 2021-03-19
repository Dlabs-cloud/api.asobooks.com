import { NestFactory } from '@nestjs/core';
import { WorkerModule } from './worker/worker.module';
import * as dotenv from 'dotenv';

async function bootstrap() {
  dotenv.config();
  const app = await NestFactory.create(WorkerModule);
  app.setGlobalPrefix(`api/v${process.env.VERSION}`);


  let port = process.env.HOST_PORT || process.env.WORKER_PORT || 5656;
  app.listen(port).then(() => {
    console.log('Worker is starting up');
    console.log(`Starting up worker on  ${port}`);
  });
}

bootstrap();
