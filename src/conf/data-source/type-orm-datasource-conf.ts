import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export class TypeOrmDatasourceConf {

  constructor(private configService: ConfigService) {
  }

  public isProduction() {
    const mode = this.configService.get('ENV', 'DEV');
    return mode === 'PROD';
  }

  public refreshSchema() {

    const mode = this.configService.get('ENV', 'DEV');
    return mode === 'test';
  }

  public getTypeOrmConfig(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: this.configService.get<string>('DB_HOST', 'localhost'),
      port: this.configService.get<number>('DB_PORT', 5432),
      password: this.configService.get<string>('DB_PASSWORD', 'postgres'),
      username: this.configService.get('DB_USERNAME', 'postgres'),
      database: this.configService.get('DB_DATABASE', 'postgres'),
      dropSchema: true,
      logging: this.configService.get('SHOW_LOG', false) === 'true',
      entities: [__dirname + '/../../domain/entity/*.entity{.js,.ts}'],
      synchronize: true,
      ssl: this.isProduction(),
    };
  }

}
