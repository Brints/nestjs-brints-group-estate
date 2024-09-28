import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';
import { UserAuth } from 'src/users/entities/userAuth.entity';
import { TimeHelper } from 'src/utils/time-helper.lib';

@Injectable()
export class SendOtpProvider {
  constructor(
    private readonly mailerService: MailerService,
    private readonly timeHelper: TimeHelper,
  ) {}

  public async sendOTP(user: User, userAuth: UserAuth): Promise<void> {
    const subject = 'OTP to verify your phone number';
    const fullname = `${user.first_name} ${user.last_name}`;
    const otp_expiry = `${this.timeHelper.getTimeLeft(userAuth.otpExpiresIn, 'minutes')}`;

    await this.mailerService.sendMail({
      to: user.email,
      from: `Brints Group <no-reply@brintsgroup.live>`,
      subject,
      template: './otp',
      context: {
        fullname,
        otp: `${userAuth.otp}`,
        otp_expiry,
      },
    });
  }
}
