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
    let jobData = job.data;
    let sendMailOptions = {
      to: jobData.to,
      subject: jobData.subject,
      template: jobData.templateName,
      context: jobData.data,
      from: jobData.from,
      replyTo: jobData.reply,
    };
    
    this.mailerService.sendMail(sendMailOptions).then(result => {
    }).catch(err => {
      console.log(err);
      console.log('Email Sending queue error');
    });


  }
}