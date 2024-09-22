import { MailerService } from '@nestjs-modules/mailer';
import { HttpStatus, Injectable } from '@nestjs/common';

import { CustomException } from 'src/exceptions/custom.exception';
import { User } from 'src/users/entities/user.entity';
import { UserAuth } from 'src/users/entities/userAuth.entity';

@Injectable()
export class MailgunService {
  constructor(private readonly mailerService: MailerService) {}

  public async sendWelcomeEmail(user: User): Promise<void> {
    await this.mailerService.sendMail({
      to: user.email,
      from: 'Onboarding Team <support@@mg.brintsgroup.live>',
      subject: 'Welcome to Brints Group Estate Service',
      template: './welcome-email',
      context: {
        fullname: `${user.first_name} ${user.last_name}`,
        email: user.email,
        login_url: `http://localhost:3001/api/users/login`,
      },
    });
  }

  public async sendVerificationTokenEmail(
    user: User,
    userAuth: UserAuth,
  ): Promise<void> {
    if (!user)
      throw new CustomException(HttpStatus.NOT_FOUND, 'User not found.');

    if (!userAuth)
      throw new CustomException(HttpStatus.NOT_FOUND, 'User Auth not found.');

    await this.mailerService.sendMail({
      to: user.email,
      from: `Brints Group <no-reply@brintsgroup.live>`,
      subject: 'Verify your email address',
      template: './email-verification-token',
      context: {
        fullname: `${user.first_name} ${user.last_name}`,
        verification_link: `http://localhost:3001/api/users/verify-email?email=${user.email}&email_verification_token=${userAuth.emailVerificationToken}`,
        token_expiry: `${userAuth.emailVerificationTokenExpiresIn}`,
      },
    });
  }

  public async sendOTP(user: User, userAuth: UserAuth): Promise<void> {
    if (!user)
      throw new CustomException(HttpStatus.NOT_FOUND, 'User does not exist.');

    if (!userAuth)
      throw new CustomException(
        HttpStatus.NOT_FOUND,
        'User Auth does not exist.',
      );

    await this.mailerService.sendMail({
      to: user.email, // change this to phone number after setting up aws ses
      from: `Brints Group <no-reply@brintsgroup.live>`,
      subject: 'OTP',
      template: './otp',
      context: {
        fullname: `${user.first_name} ${user.last_name}`,
        otp: `${userAuth.otp}`,
        otp_expiry: `${userAuth.otpExpiresIn}`,
      },
    });
  }

  public async sendPasswordResetToken(
    user: User,
    userAuth: UserAuth,
  ): Promise<void> {
    if (!user)
      throw new CustomException(HttpStatus.NOT_FOUND, 'User does not exist.');

    if (!userAuth)
      throw new CustomException(
        HttpStatus.NOT_FOUND,
        'User Auth does not exist.',
      );

    await this.mailerService.sendMail({
      to: user.email,
      from: `Brints Group <no-reply@brintsgroup.live>`,
      subject: 'Reset Password',
      template: './reset-password',
      context: {
        fullname: `${user.first_name} ${user.last_name}`,
        reset_password_link: `http://localhost:3001/api/users/reset-password/${user.email}/${userAuth.passwordResetToken}`,
        expiry: `${userAuth.passwordResetTokenExpiresIn}`,
      },
    });
  }
}
