import { SequenceGeneratorImpl } from '../../common/sequence/SequenceGeneratorImpl';
import { Connection } from 'typeorm';
import { zeroFills } from '../../common/UsefulUtils';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ServiceFeeCodeSequence extends SequenceGeneratorImpl {
  constructor(private readonly connection: Connection) {
    super('service_fee_code_sequence', connection.createEntityManager());
  }

  async next(): Promise<string> {
    const long = await this.nextLong();
    // tslint:disable-next-line:no-console
    return `SF${zeroFills(long, 10)}`;
  }
}