import { Injectable } from '@nestjs/common';

import { VerifyEmailDto } from '../dto/verify-email.dto';
import { VerifyPhoneNumberDto } from '../dto/verify-phone-number.dto';
import { VerifyEmailProvider } from './verify-email.provider';
import { VerifyPhoneNumberProvider } from './verify-phone-number.provider';
import { GenerateNewOTPDto } from '../dto/generate-new-otp.dto';
import { ResendOtpProvider } from './resend-otp.provider';
import { GenerateNewEmailVerificationProvider } from './generate-new-email-verification.provider';
import { GenerateNewEmailTokenDto } from '../dto/new-email-token.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly verifyEmailProvider: VerifyEmailProvider,

    private readonly verifyPhoneNumberProvider: VerifyPhoneNumberProvider,

    private readonly resendOtpProvider: ResendOtpProvider,

    private readonly generateNewEmailVerificationProvider: GenerateNewEmailVerificationProvider,
  ) {}

  public async verifyUserEmail(verifyEmailDto: VerifyEmailDto) {
    return this.verifyEmailProvider.verifyUserEmail(verifyEmailDto);
  }

  public async verifyPhoneNumber(verifyPhoneNumberDto: VerifyPhoneNumberDto) {
    return this.verifyPhoneNumberProvider.verifyPhoneNumber(
      verifyPhoneNumberDto,
    );
  }

  public async resendOTP(generateNewOTPDto: GenerateNewOTPDto) {
    return this.resendOtpProvider.resendOTP(generateNewOTPDto);
  }

  public async newEmailVerificationToken(
    generateNewEmailTokenDto: GenerateNewEmailTokenDto,
  ) {
    return this.generateNewEmailVerificationProvider.newEmailVerificationToken(
      generateNewEmailTokenDto,
    );
  }
}
