import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {ValidatorTransformPipe} from './conf/validator-transform.pipe';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.setGlobalPrefix(`api/v${process.env.VERSION}`);
    app.useGlobalPipes(new ValidatorTransformPipe());

     app.listen(process.env.HOST_PORT).then(() => {
         console.log(`Starting application on port ${process.env.HOST_PORT}`);
         console.log(`Url:: ${process.env.DOMAIN}:${process.env.HOST_PORT}/api/v${process.env.VERSION}`)
     });
}

bootstrap();
