import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { BankRepository } from '../../dao/bank.repository';
import * as fs from 'fs';
import { Writable } from 'stream';
import { Connection, getConnection } from 'typeorm';
import { Bank } from '../../domain/entity/bank.entity';
import StreamArray = require('stream-json/streamers/StreamArray');
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BankUploadStartup implements OnApplicationBootstrap {
  constructor(private readonly connection: Connection) {
  }

  async onApplicationBootstrap() {

    const totalBanks = await this.connection.getCustomRepository(BankRepository).count();
    if (!totalBanks) {
      this.uploadBanks();
    }
  }


  private uploadBanks() {
    const fileStream = fs.createReadStream(process.cwd() + '/docs/banks.json');
    const jsonStream = StreamArray.withParser();
    const processingStream = new Writable({
      write({ key, value }, encoding, callback) {
        const bank = {
          name: value.name,
          code: value.code,
          flutterWaveReference: value.flutterWaveCode,
        };
        const bankRepository = getConnection()
          .getCustomRepository(BankRepository);

        bankRepository.findOneItemByStatus({
          code: bank.code,
        }).then((existingBank) => {
          if (existingBank) {
            existingBank.name = bank.name;
            existingBank.flutterWaveReference = bank.flutterWaveReference;
            bankRepository.save(existingBank).then(savedBank => {
              console.log(`${savedBank.name} has been updated`);
            });
          } else {
            bankRepository.save(bank).then(savedBank => {
              console.log(`${savedBank.name} has been  newly saved`);
            });
          }

        });
        setTimeout(() => {
          callback();
        }, 1000);
      },
      objectMode: true,
    });
    fileStream.pipe(jsonStream);
    jsonStream.pipe(processingStream);

    processingStream.on('finish', () => console.log('All done!! On to the nest start up action!!'));
  }

}