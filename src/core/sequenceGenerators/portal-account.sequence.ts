import {Injectable} from '@nestjs/common';
import {Connection, EntityManager} from 'typeorm';
import {SequenceGeneratorImpl} from '../../common/sequence/SequenceGeneratorImpl';
import {zeroFills} from '../../common/UsefulUtils';

@Injectable()
export class PortalAccountSequence extends SequenceGeneratorImpl {
    constructor(private readonly connection: Connection) {
        super('portal_account_code', connection.createEntityManager());
    }

    async next(): Promise<string> {
        const long = await this.nextLong();
        // tslint:disable-next-line:no-console
        return `ACT${zeroFills(long, 10)}`;
    }
}
