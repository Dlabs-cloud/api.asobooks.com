import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {CoreModule} from '../core/core.module';

@Module({
    imports: [
        CoreModule,
    ],
})
export class DomainModule {
}
