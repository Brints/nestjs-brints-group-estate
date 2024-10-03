import { Injectable } from '@nestjs/common';
import { AwsSmsProvider } from './aws-sms.provider';
import { TimeHelper } from 'src/utils/time-helper.lib';
import { User } from 'src/users/entities/user.entity';
import { UserAuth } from 'src/users/entities/userAuth.entity';

@Injectable()
export class AwsSmsService {
  constructor(
    private readonly awsSmsProvider: AwsSmsProvider,

    private readonly timeHelper: TimeHelper,
  ) {}

  public async sendOTPSms(user: User, userAuth: UserAuth): Promise<void> {
    const fullname = `${user.first_name} ${user.last_name}`;
    const message = `Hey ${fullname}. Thank you for signing up on Brints. Kindly use this OTP ${userAuth.otp} to verify your phone number. This OTP expires in ${this.timeHelper.getTimeLeft(userAuth.otpExpiresIn, 'minutes')}.`;
    await this.awsSmsProvider.sendSms(user.phone_number, message);
  }
}
