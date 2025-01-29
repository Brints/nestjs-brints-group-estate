import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class SendResetPasswordConfirmationProvider {
  constructor(private readonly mailerService: MailerService) {}

  public async sendResetPasswordConfirmation(user: User): Promise<void> {
    const fullname = `${user.first_name} ${user.last_name}`;
    const subject = 'Password Reset Confirmed';

    await this.mailerService.sendMail({
      to: user.email,
      from: `Brints Group <no-reply@brintsgroup.live>`,
      subject,
      template: './password-reset-confirmation',
      context: {
        fullname,
      },
    });
  }
}
