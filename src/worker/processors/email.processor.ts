import { Process, Processor } from '@nestjs/bull';
import { Queues } from '../../core/cron.enum';
import { Job } from 'bull';
import { EmailQueueDto } from '../../dto/email-queue.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { Log } from '../../conf/logger/Logger';

@Processor(Queues.EMAIL)
export class EmailProcessor {

  constructor(private readonly mailerService: MailerService, private readonly log: Log) {
  }

  @Process()
  handle(job: Job<EmailQueueDto<any>>) {
    let jobData = job.data;
    let sendMailOptions = {
      to: jobData.to,
      subject: jobData.subject,
      template: jobData.templateName,
      context: jobData.data,
      from: jobData.from,
      replyTo: jobData.reply,
    };

    return this.mailerService.sendMail(sendMailOptions).catch(error => {
      this.log.error('There was an error sending email');
      throw error;
    });


  }
}
