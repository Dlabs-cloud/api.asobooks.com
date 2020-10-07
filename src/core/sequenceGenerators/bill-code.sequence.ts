import { SequenceGeneratorImpl } from '../../common/sequence/SequenceGeneratorImpl';
import { Connection } from 'typeorm';
import { zeroFills } from '../../common/UsefulUtils';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BillCodeSequence extends SequenceGeneratorImpl {

  constructor(private readonly connection: Connection) {
    super('bill_code', connection.createEntityManager());
  }

  async next(): Promise<string> {
    const long = await this.nextLong();
    // tslint:disable-next-line:no-console
    return `BILL-${zeroFills(long, 10)}/${Math.random().toString(36).substring(7)}`;
  }
}