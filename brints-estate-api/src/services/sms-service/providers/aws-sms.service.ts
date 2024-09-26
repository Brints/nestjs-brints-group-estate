import { Injectable } from '@nestjs/common';
import { AwsSmsProvider } from './aws-sms.provider';
import { TimeHelper } from 'src/utils/time-helper.lib';

@Injectable()
export class AwsSmsService {
  constructor(
    private readonly awsSmsProvider: AwsSmsProvider,

    private readonly timeHelper: TimeHelper,
  ) {}

  public async sendOTPSms(
    fullname: string,
    phoneNumber: string,
    otpExpiry: Date | null,
    otp: number | null,
  ): Promise<void> {
    const message = `Hey ${fullname}. Thank you for signing up on Brints. Kindly use this OTP ${otp} to verify your phone number. This OTP expires in ${this.timeHelper.getTimeLeft(otpExpiry, 'minutes')}.`;
    await this.awsSmsProvider.sendSms(phoneNumber, message);
  }
}
