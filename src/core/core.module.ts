import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {PortalAccountSequence} from './sequenceGenerators/portal-account.sequence';

@Module({
    exports: [
        PortalAccountSequence,
    ],
    providers: [
        PortalAccountSequence,
    ],
})

export class CoreModule {
}
