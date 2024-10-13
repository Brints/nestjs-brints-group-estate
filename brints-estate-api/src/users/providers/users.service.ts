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
import { IActiveUser } from '../../auth/interfaces/active-user.interface';
import { ResetPasswordProvider } from './reset-password.provider';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { ChangePasswordProvider } from './change-password.provider';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { User } from '../entities/user.entity';
import { ForgotPasswordProvider } from './forgot-password.provider';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { IResetPassword } from '../interface/reset-password.interface';
import { UpdateUserProvider } from './update-user.provider';
import { UpdateUserDto } from '../dto/update-user.dto';
import { FindOneByGoogleIdProvider } from './find-one-by-google-id.provider';
import { CreateGoogleUserProvider } from './create-google-user.provider';
import { GoogleUser } from '../interface/google-user.interface';

@Injectable()
export class UsersService {
  constructor(
    private readonly verifyEmailProvider: VerifyEmailProvider,

    private readonly verifyPhoneNumberProvider: VerifyPhoneNumberProvider,

    private readonly resendOtpProvider: ResendOtpProvider,

    private readonly generateNewEmailVerificationProvider: GenerateNewEmailVerificationProvider,

    private readonly getUserProfileProvider: GetUserProfileProvider,

    private readonly resetPasswordProvider: ResetPasswordProvider,

    private readonly changePasswordProvider: ChangePasswordProvider,

    private readonly forgotPasswordProvider: ForgotPasswordProvider,

    private readonly updateUserProvider: UpdateUserProvider,

    private readonly findOneByGoogleIdProvider: FindOneByGoogleIdProvider,

    private readonly createGoogleUserProvider: CreateGoogleUserProvider,
  ) {}

  public async verifyUserEmail(verifyEmailDto: VerifyEmailDto) {
    return await this.verifyEmailProvider.verifyUserEmail(verifyEmailDto);
  }

  public async verifyPhoneNumber(verifyPhoneNumberDto: VerifyPhoneNumberDto) {
    return await this.verifyPhoneNumberProvider.verifyPhoneNumber(
      verifyPhoneNumberDto,
    );
  }

  public async resendOTP(generateNewOTPDto: GenerateNewOTPDto) {
    return await this.resendOtpProvider.resendOTP(generateNewOTPDto);
  }

  public async newEmailVerificationToken(
    generateNewEmailTokenDto: GenerateNewEmailTokenDto,
  ) {
    return await this.generateNewEmailVerificationProvider.newEmailVerificationToken(
      generateNewEmailTokenDto,
    );
  }

  public async getUserProfile(
    loggedInUser: IActiveUser,
    userId: string,
  ): Promise<User> {
    return await this.getUserProfileProvider.getUserProfile(
      loggedInUser,
      userId,
    );
  }

  public async resetPassword(
    params: IResetPassword,
    resetPasswordDto: ResetPasswordDto,
  ): Promise<void> {
    return await this.resetPasswordProvider.resetPassword(
      params,
      resetPasswordDto,
    );
  }

  public async changePassword(
    activeUser: IActiveUser,
    changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    return await this.changePasswordProvider.changePassword(
      activeUser,
      changePasswordDto,
    );
  }

  public async forgotPassword(
    forgotPasswordDto: ForgotPasswordDto,
  ): Promise<void> {
    return await this.forgotPasswordProvider.forgotPassword(forgotPasswordDto);
  }

  public async updateUser(
    updateUserDto: UpdateUserDto,
    userId: string,
    activeUser: IActiveUser,
    file: Express.Multer.File,
  ): Promise<User> {
    return await this.updateUserProvider.update(
      updateUserDto,
      userId,
      activeUser,
      file,
    );
  }

  public async findOneByGoogleId(googleId: string): Promise<User | null> {
    return await this.findOneByGoogleIdProvider.findOneByGoogleId(googleId);
  }

  public async createGoogleUser(googleUser: GoogleUser): Promise<User> {
    return await this.createGoogleUserProvider.createGoogleUser(googleUser);
  }
}
