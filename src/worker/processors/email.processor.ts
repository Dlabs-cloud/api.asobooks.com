import { Process, Processor } from '@nestjs/bull';
import { Queues } from '../../core/cron.enum';
import { Job } from 'bull';
import { EmailQueueDto } from '../../dto/email-queue.dto';
import { MailerService } from '@nestjs-modules/mailer';

@Processor(Queues.EMAIL)
export class EmailProcessor {

  constructor(private readonly mailerService: MailerService) {
  }

  @Process()
  handle(job: Job<EmailQueueDto<any>>) {
    let data = job.data;
    let sendMailOptions = {
      to: data.to,
      subject: data.subject,
      template: data.templateName,
      context: data,
      from: data.from,
      replyTo: data.reply,
    };

    this.mailerService.sendMail(sendMailOptions).then(result => {
    }).catch(err => {
      console.log('Email Sending queue error');
    });


  }
}