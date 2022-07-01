import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  public sendMail(
    to: string,
    subject: string,
    template: string,
    context: object,
  ): void {
    this.mailerService
      .sendMail({
        to: to,
        from: `"Demo" <${this.configService.get('mailer.email')}>`,
        subject: subject,
        template: template,
        context: context,
      })
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      .then(() => {})
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      .catch((err) => {
        console.log(err);
      });
  }
}
