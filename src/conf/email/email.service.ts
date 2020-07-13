import { ConfigService } from '@nestjs/config';
import { MailerOptions } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';


export class EmailConfiguration {


  constructor(private readonly configService: ConfigService) {
  }


  public getEmailConfig(): MailerOptions {
    console.log(process.cwd() + '/template/');
    return {
      transport: {
        host: this.configService.get<string>('MAILER_HOST', 'smtp.example.com'),
        port: this.configService.get<number>('EMAIL_PORT', 587),
        secure: false,
        auth: {
          user: this.configService.get<string>('EMAIL_USER', 'dlabs_mailer'),
          pass: this.configService.get<string>('EMAIL_PASS', 'dlabs_password'),
        },
        defaults: {
          from: this.configService.get<string>('EMAIL_SENDER', '"No Reply" <no-reply@socialite.io>'),
        },
        preview: true,
        template: {
          dir: process.cwd() + '/template',
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      },

    };

  }
}