import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersController } from './users.controller';
import { UsersService } from './providers/users.service';
import { AuthModule } from '../auth/auth.module';

import { User } from './entities/user.entity';
import { UserAuth } from './entities/userAuth.entity';
import { GenerateNewEmailVerificationProvider } from './providers/generate-new-email-verification.provider';
import { VerifyEmailProvider } from './providers/verify-email.provider';
import { VerifyPhoneNumberProvider } from './providers/verify-phone-number.provider';
import { ResendOtpProvider } from './providers/resend-otp.provider';
import { GenerateTokenHelper } from '../utils/generate-token.lib';
import { GetUserProfileProvider } from './providers/get-user-profile.provider';
import { ForgotPasswordProvider } from './providers/forgot-password.provider';
import { ResetPasswordProvider } from './providers/reset-password.provider';
import { HashingProvider } from '../auth/providers/hashing.provider';
import { BcryptProvider } from '../auth/providers/bcrypt.provider';
import { ChangePasswordProvider } from './providers/change-password.provider';
import { TimeHelper } from 'src/utils/time-helper.lib';
import { MailgunService } from 'src/messaging/email/mailgun-service/providers/mailgun.service';
import { SendPasswordResetTokenProvider } from 'src/messaging/email/mailgun-service/providers/send-password-reset-token.provider';
import { SendPasswordChangedEmailProvider } from 'src/messaging/email/mailgun-service/providers/send-password-changed-email.provider';
import { SendWelcomeEmailProvider } from 'src/messaging/email/mailgun-service/providers/send-welcome-email.provider';
import { SendVerificationTokenEmailProvider } from 'src/messaging/email/mailgun-service/providers/send-verification-token-email.provider';
import { SendOtpProvider } from 'src/messaging/email/mailgun-service/providers/send-otp.provider';
import { SendResetPasswordConfirmationProvider } from 'src/messaging/email/mailgun-service/providers/send-reset-password-confirmation.provider';
import { UpdateUserProvider } from './providers/update-user.provider';
import { UploadToAwsProvider } from 'src/uploads/providers/upload-to-aws.provider';
import { AppConfigService } from 'src/config/config.service';
import { AwsSmsService } from 'src/messaging/sms/providers/aws-sms.service';
import { AwsSmsProvider } from 'src/messaging/sms/providers/aws-sms.provider';
import { UserHelper } from 'src/utils/userHelper.lib';
import { FindOneByGoogleIdProvider } from './providers/find-one-by-google-id.provider';
import { CreateGoogleUserProvider } from './providers/create-google-user.provider';
import { DeleteUserProfileProvider } from './providers/delete-user-profile.provider';

@Module({
  controllers: [UsersController],
  providers: [
    {
      provide: HashingProvider,
      useClass: BcryptProvider,
    },
    UsersService,
    VerifyEmailProvider,
    VerifyPhoneNumberProvider,
    ResendOtpProvider,
    GenerateTokenHelper,
    GetUserProfileProvider,
    ForgotPasswordProvider,
    ResetPasswordProvider,
    GenerateNewEmailVerificationProvider,
    ChangePasswordProvider,
    TimeHelper,
    MailgunService,
    SendPasswordResetTokenProvider,
    SendPasswordChangedEmailProvider,
    SendWelcomeEmailProvider,
    SendVerificationTokenEmailProvider,
    SendOtpProvider,
    SendResetPasswordConfirmationProvider,
    UpdateUserProvider,
    UploadToAwsProvider,
    AppConfigService,
    AwsSmsService,
    AwsSmsProvider,
    UserHelper,
    FindOneByGoogleIdProvider,
    CreateGoogleUserProvider,
    DeleteUserProfileProvider,
  ],
  imports: [
    TypeOrmModule.forFeature([User, UserAuth]),
    forwardRef(() => AuthModule),
  ],
  exports: [TypeOrmModule, UsersService],
})
export class UsersModule {}
