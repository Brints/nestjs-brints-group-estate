import { Injectable } from '@nestjs/common';

import { VerifyEmailDto } from '../dto/verify-email.dto';
import { VerifyPhoneNumberDto } from '../dto/verify-phone-number.dto';
import { VerifyEmailProvider } from './verify-email.provider';
import { VerifyPhoneNumberProvider } from './verify-phone-number.provider';
import { GenerateNewOTPDto } from '../dto/generate-new-otp.dto';
import { ResendOtpProvider } from './resend-otp.provider';
import { GenerateNewEmailVerificationProvider } from './generate-new-email-verification.provider';
import { GenerateNewEmailTokenDto } from '../dto/new-email-token.dto';
import { GetUserProfileProvider } from './get-user-profile.provider';
import { IActiveUser } from 'src/auth/interfaces/active-user.interface';

@Injectable()
export class UsersService {
  constructor(
    private readonly verifyEmailProvider: VerifyEmailProvider,

    private readonly verifyPhoneNumberProvider: VerifyPhoneNumberProvider,

    private readonly resendOtpProvider: ResendOtpProvider,

    private readonly generateNewEmailVerificationProvider: GenerateNewEmailVerificationProvider,

    private readonly getUserProfileProvider: GetUserProfileProvider,
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

  public async getUserProfile(loggedInUser: IActiveUser, userId: string) {
    return this.getUserProfileProvider.getUserProfile(loggedInUser, userId);
  }
}
