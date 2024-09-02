import { forwardRef, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './providers/auth.service';
import { UsersModule } from 'src/users/users.module';
import { HashingProvider } from './providers/hashing.provider';
import { BcryptProvider } from './providers/bcrypt.provider';
import { CreateUserProvider } from './providers/create-user.provider';
import { UserHelper } from 'src/utils/userHelper.lib';
import { GenerateTokenHelper } from 'src/utils/generate-token.lib';
import { LoginUserProvider } from './providers/login-user.provider';

@Module({
  controllers: [AuthController],
  providers: [
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
  imports: [forwardRef(() => UsersModule)],
  exports: [AuthService, HashingProvider],
})
export class AuthModule {}
