import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { AuthController } from './auth.controller';
import { AuthService } from './providers/auth.service';
import { UsersModule } from 'src/users/users.module';
import { HashingProvider } from './providers/hashing.provider';
import { BcryptProvider } from './providers/bcrypt.provider';
import { CreateUserProvider } from './providers/create-user.provider';
import { UserHelper } from '../utils/userHelper.lib';
import { GenerateTokenHelper } from '../utils/generate-token.lib';
import { LoginUserProvider } from './providers/login-user.provider';
import jwtConfig from './config/jwt.config';

@Module({
  controllers: [AuthController],
  providers: [
    ConfigService,
    AuthService,
    CreateUserProvider,
    LoginUserProvider,
    UserHelper,
    GenerateTokenHelper,
    {
      provide: HashingProvider,
      useClass: BcryptProvider,
    },
  ],
  imports: [
    forwardRef(() => UsersModule),
    ConfigModule.forFeature(jwtConfig),
    JwtModule.registerAsync(jwtConfig.asProvider()),
  ],
  exports: [AuthService, HashingProvider],
})
export class AuthModule {}
