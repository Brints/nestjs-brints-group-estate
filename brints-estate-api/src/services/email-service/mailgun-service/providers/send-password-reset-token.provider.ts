import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';
import { UserAuth } from 'src/users/entities/userAuth.entity';

@Injectable()
export class SendPasswordResetTokenProvider {
  constructor(private readonly mailerService: MailerService) {}

  public async sendPasswordResetToken(user: User, userAuth: UserAuth) {
    const fullname = `${user.first_name} ${user.last_name}`;
    const subject = 'Password Reset Token';
    const expiry = `${userAuth.passwordResetTokenExpiresIn}`;
    const reset_password_link = `http://localhost:3001/api/users/reset-password/${user.email}/${userAuth.passwordResetToken}`;

    await this.mailerService.sendMail({
      to: user.email,
      from: `Brints Group <no-reply@brintsgroup.live>`,
      subject,
      template: './reset-password',
      context: {
        fullname,
        reset_password_link,
        expiry,
      },
    });
  }
}
