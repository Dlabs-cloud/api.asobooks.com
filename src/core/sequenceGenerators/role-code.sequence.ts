import { SequenceGeneratorImpl } from '../../common/sequence/SequenceGeneratorImpl';
import { Connection } from 'typeorm';
import { zeroFills } from '../../common/useful-Utils';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RoleCodeSequence extends SequenceGeneratorImpl {
  constructor(private readonly connection: Connection) {
    super('service_fee_code', connection.createEntityManager());
  }

  async next(): Promise<string> {
    const long = await this.nextLong();
    // tslint:disable-next-line:no-console
    return `ROLES-${zeroFills(long, 10)}`;
  }
}