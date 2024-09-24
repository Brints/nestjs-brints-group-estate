import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { AuthController } from './auth.controller';
import { AuthService } from './providers/auth.service';
import { UsersModule } from '../users/users.module';
import { LoginAttemptsModule } from '../login-attempts/login-attempts.module';
import { HashingProvider } from './providers/hashing.provider';
import { BcryptProvider } from './providers/bcrypt.provider';
import { CreateUserProvider } from './providers/create-user.provider';
import { UserHelper } from '../utils/userHelper.lib';
import { GenerateTokenHelper } from '../utils/generate-token.lib';
import { LoginUserProvider } from './providers/login-user.provider';
import { GenerateTokensProvider } from './providers/generate-tokens.provider';
import { RefreshTokensProvider } from './providers/refresh-tokens.provider';
import jwtConfig from './config/jwt.config';
import { AppConfigService } from '../config/config.service';
import { UploadToAwsProvider } from '../uploads/providers/upload-to-aws.provider';
import { LoginAttemptsProvider } from '../login-attempts/providers/login-attempts.provider';
import { TimeHelper } from 'src/utils/time-helper.lib';

@Module({
  controllers: [AuthController],
  providers: [
    {
      provide: HashingProvider,
      useClass: BcryptProvider,
    },
    ConfigService,
    AuthService,
    CreateUserProvider,
    LoginUserProvider,
    UserHelper,
    GenerateTokenHelper,
    GenerateTokensProvider,
    RefreshTokensProvider,
    AppConfigService,
    UploadToAwsProvider,
    LoginAttemptsProvider,
    TimeHelper,
  ],
  imports: [
    forwardRef(() => UsersModule),
    forwardRef(() => LoginAttemptsModule),
    ConfigModule.forFeature(jwtConfig),
    JwtModule.registerAsync(jwtConfig.asProvider()),
  ],
  exports: [AuthService, HashingProvider],
})
export class AuthModule {}
