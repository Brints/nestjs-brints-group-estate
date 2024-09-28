import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class SendPasswordChangedEmailProvider {
  constructor(private readonly mailerService: MailerService) {}

  public async sendPasswordChanged(user: User): Promise<void> {
    const fullname = `${user.first_name} ${user.last_name}`;
    const subject = 'Password Changed Successfully';

    await this.mailerService.sendMail({
      to: user.email,
      from: `Brints Group <no-reply@brintsgroup.live>`,
      template: './password-changed',
      subject,
      context: {
        fullname,
      },
    });
  }
}
