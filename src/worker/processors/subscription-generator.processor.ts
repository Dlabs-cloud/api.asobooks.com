import { Injectable } from '@nestjs/common';
import { Connection } from 'typeorm';
import { Process, Processor } from '@nestjs/bull';
import { CronQueue } from '../../core/cron.enum';
import { Job } from 'bull';

@Processor(CronQueue.SUBSCRIPTION)
export class SubscriptionGeneratorProcessor {
  constructor(private readonly connection: Connection) {
  }

  @Process()
  generate(data: Job<unknown>){
    console.log('logging here===============>')
  }
}