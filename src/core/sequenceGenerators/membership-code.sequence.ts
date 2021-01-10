import { SequenceGeneratorImpl } from '../../common/sequence/SequenceGeneratorImpl';
import { Injectable } from '@nestjs/common';
import { Connection } from 'typeorm';
import { zeroFills } from '../../common/useful-Utils';

@Injectable()
export class MembershipCodeSequence extends SequenceGeneratorImpl {

  constructor(private readonly connection: Connection) {
    super('membership_code', connection.createEntityManager());
  }

  async next(): Promise<string> {
    const long = await this.nextLong();
    // tslint:disable-next-line:no-console
    return `MEMB${zeroFills(long, 10)}`;
  }
}