import { Injectable } from '@nestjs/common';
import { AwsSesProvider } from './aws-ses.provider';
import { User } from 'src/users/entities/user.entity';
import { UserAuth } from 'src/users/entities/userAuth.entity';
import { TimeHelper } from 'src/utils/time-helper.lib';

@Injectable()
export class SendVerificationTokenEmailProvider {
  constructor(
    private readonly awsSesProvider: AwsSesProvider,
    private readonly timeHelper: TimeHelper,
  ) {}

  public async sendVerificationTokenEmail(user: User, userAuth: UserAuth) {
    const subject = 'Verify your email address';
    const message = `Hello ${user.first_name},\n\nPlease verify your email address by clicking on the link below:\n\nhttp://localhost:3001/api/user/verify-email?email=${user.email}&email_verification_token=${userAuth.emailVerificationToken}\n\nThis link will expire in ${this.timeHelper.getTimeLeft(userAuth.emailVerificationTokenExpiresIn, 'hours')}.\n\nThank you,\nBrints Group`;

    await this.awsSesProvider.sendAwsEmail(user.email, subject, message);
  }
}
