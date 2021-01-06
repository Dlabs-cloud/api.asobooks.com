import { SequenceGeneratorImpl } from '../../common/sequence/SequenceGeneratorImpl';
import { Connection } from 'typeorm';
import { zeroFills } from '../../common/UsefulUtils';
import { Injectable } from '@nestjs/common';
import * as uuid from 'uuid';


@Injectable()
export class PaymentRequestReferenceSequence extends SequenceGeneratorImpl {

  constructor(private readonly connection: Connection) {
    super('payment_request_reference', connection.createEntityManager());
  }

  async next(): Promise<string> {
    const long = await this.nextLong();
    // tslint:disable-next-line:no-console
    const ref = uuid.v4();
    return `PAY-${ref.substr(ref.length - 10, ref.length - 1)}-${zeroFills(long, 10)}`;
  }
}