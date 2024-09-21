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

@Module({
  controllers: [UsersController],
  providers: [
    UsersService,
    VerifyEmailProvider,
    VerifyPhoneNumberProvider,
    ResendOtpProvider,
    GenerateTokenHelper,
    GetUserProfileProvider,
    ForgotPasswordProvider,
    ResetPasswordProvider,
    GenerateNewEmailVerificationProvider,
    {
      provide: HashingProvider,
      useClass: BcryptProvider,
    },
    ChangePasswordProvider,
  ],
  imports: [
    TypeOrmModule.forFeature([User, UserAuth]),
    forwardRef(() => AuthModule),
  ],
  exports: [TypeOrmModule, UsersService],
})
export class UsersModule {}
