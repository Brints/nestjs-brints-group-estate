import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoginAttempts } from './entities/login-attempt.entity';
import { LoginAttemptsProvider } from './providers/login-attempts.provider';
import { UsersModule } from '../users/users.module';

@Module({
  providers: [LoginAttemptsProvider],
  imports: [
    forwardRef(() => UsersModule),
    TypeOrmModule.forFeature([LoginAttempts]),
  ],
  exports: [TypeOrmModule, LoginAttemptsProvider],
})
export class LoginAttemptsModule {}
