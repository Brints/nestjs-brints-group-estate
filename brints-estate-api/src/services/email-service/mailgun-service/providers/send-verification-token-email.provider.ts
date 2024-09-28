import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';
import { UserAuth } from 'src/users/entities/userAuth.entity';
import { TimeHelper } from 'src/utils/time-helper.lib';

@Injectable()
export class SendVerificationTokenEmailProvider {
  constructor(
    private readonly mailerService: MailerService,
    private readonly timeHelper: TimeHelper,
  ) {}

  public async sendVerificationTokenEmail(
    user: User,
    userAuth: UserAuth,
  ): Promise<void> {
    const subject = 'Verify your email address';
    const fullname = `${user.first_name} ${user.last_name}`;
    const verification_link = `http://localhost:3001/api/user/verify-email?email=${user.email}&email_verification_token=${userAuth.emailVerificationToken}`;
    const token_expiry = `${this.timeHelper.getTimeLeft(userAuth.emailVerificationTokenExpiresIn, 'hours')}`;

    await this.mailerService.sendMail({
      to: user.email,
      from: `Brints Group <no-reply@brintsgroup.live>`,
      subject,
      template: './email-verification-token',
      context: {
        fullname,
        verification_link,
        token_expiry,
      },
    });
  }
}
