import { SequenceGeneratorImpl } from '../../common/sequence/SequenceGeneratorImpl';
import { Injectable } from '@nestjs/common';
import { Connection } from 'typeorm';
import * as uuid from 'uuid';
import { zeroFills } from '../../common/useful-Utils';

@Injectable()
export class PaymentTransactionSequence extends SequenceGeneratorImpl {

  constructor(private readonly connection: Connection) {
    super('paymentTransaction_reference', connection.createEntityManager());
  }

  async next(): Promise<string> {
    const long = await this.nextLong();
    // tslint:disable-next-line:no-console
    const ref = uuid.v4();
    return `TRAN-${ref.substr(ref.length - 10, ref.length - 1)}-${zeroFills(long, 10)}`;
  }
}