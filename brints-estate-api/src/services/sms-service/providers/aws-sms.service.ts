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

  public async sendPhoneNumberUpdateOTPSms(
    phoneNumber: string,
    user: User,
    userAuth: UserAuth,
  ): Promise<void> {
    const fullname = `${user.first_name} ${user.last_name}`;
    const message = `Hey ${fullname}. You requested to update your phone number on Brints. Kindly use this OTP ${userAuth.otp} to verify your new phone number. This OTP expires in ${this.timeHelper.getTimeLeft(userAuth.otpExpiresIn, 'minutes')}.`;
    await this.awsSmsProvider.sendSms(phoneNumber, message);
  }

  public async sendVerificationSuccess(user: User): Promise<void> {
    const fullname = `${user.first_name} ${user.last_name}`;
    const message = `Congratulations ${fullname}.\n Your phone number hass been verified successfully. Kindly verify your email to have access to Brints platform. Happy searching.`;
    await this.awsSmsProvider.sendSms(user.phone_number, message);
  }
}
