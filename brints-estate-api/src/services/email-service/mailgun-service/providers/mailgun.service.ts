import { Injectable } from '@nestjs/common';

import { User } from 'src/users/entities/user.entity';
import { UserAuth } from 'src/users/entities/userAuth.entity';
import { SendWelcomeEmailProvider } from './send-welcome-email.provider';
import { SendVerificationTokenEmailProvider } from './send-verification-token-email.provider';
import { SendOtpProvider } from './send-otp.provider';
import { SendPasswordResetTokenProvider } from './send-password-reset-token.provider';
import { SendResetPasswordConfirmationProvider } from './send-reset-password-confirmation.provider';
import { SendPasswordChangedEmailProvider } from './send-password-changed-email.provider';

@Injectable()
export class MailgunService {
  constructor(
    private readonly sendWelcomeEmailProvider: SendWelcomeEmailProvider,
    private readonly sendVerificationTokenEmailProvider: SendVerificationTokenEmailProvider,
    private readonly sendOtpProvider: SendOtpProvider,
    private readonly sendResetPasswordTokenProvider: SendPasswordResetTokenProvider,
    private readonly sendResetPasswordConfirmationProvider: SendResetPasswordConfirmationProvider,
    private readonly sendPasswordChangedEmailProvider: SendPasswordChangedEmailProvider,
  ) {}

  public async sendWelcomeEmail(user: User) {
    await this.sendWelcomeEmailProvider.sendWelcomeEmail(user);
  }

  public async sendVerificationTokenEmail(user: User, userAuth: UserAuth) {
    await this.sendVerificationTokenEmailProvider.sendVerificationTokenEmail(
      user,
      userAuth,
    );
  }

  public async sendOTP(user: User, userAuth: UserAuth) {
    await this.sendOtpProvider.sendOTP(user, userAuth);
  }

  public async sendPasswordReset(user: User, userAuth: UserAuth) {
    await this.sendResetPasswordTokenProvider.sendPasswordResetToken(
      user,
      userAuth,
    );
  }

  public async sendResetPasswordConfirmation(user: User) {
    await this.sendResetPasswordConfirmationProvider.sendResetPasswordConfirmation(
      user,
    );
  }

  public async sendPasswordChanged(user: User) {
    await this.sendPasswordChangedEmailProvider.sendPasswordChanged(user);
  }
}
