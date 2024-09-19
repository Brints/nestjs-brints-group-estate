import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersController } from './users.controller';
import { UsersService } from './providers/users.service';
import { AuthModule } from 'src/auth/auth.module';

import { User } from './entities/user.entity';
import { UserAuth } from './entities/userAuth.entity';
import { GenerateNewEmailVerificationProvider } from './providers/generate-new-email-verification.provider';
import { VerifyEmailProvider } from './providers/verify-email.provider';
import { VerifyPhoneNumberProvider } from './providers/verify-phone-number.provider';
import { ResendOtpProvider } from './providers/resend-otp.provider';
import { GenerateTokenHelper } from 'src/utils/generate-token.lib';
import { GetUserProfileProvider } from './providers/get-user-profile.provider';
import { ForgotPasswordProvider } from './providers/forgot-password.provider';

@Module({
  controllers: [UsersController],
  providers: [
    UsersService,
    GenerateNewEmailVerificationProvider,
    VerifyEmailProvider,
    VerifyPhoneNumberProvider,
    ResendOtpProvider,
    GenerateTokenHelper,
    GetUserProfileProvider,
    ForgotPasswordProvider,
  ],
  imports: [
    TypeOrmModule.forFeature([User, UserAuth]),
    forwardRef(() => AuthModule),
  ],
  exports: [TypeOrmModule, UsersService],
})
export class UsersModule {}
