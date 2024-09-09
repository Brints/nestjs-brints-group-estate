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

@Module({
  controllers: [UsersController],
  providers: [
    UsersService,
    GenerateNewEmailVerificationProvider,
    VerifyEmailProvider,
    VerifyPhoneNumberProvider,
    ResendOtpProvider,
  ],
  imports: [
    TypeOrmModule.forFeature([User, UserAuth]),
    forwardRef(() => AuthModule),
  ],
  exports: [TypeOrmModule, UsersService],
})
export class UsersModule {}
