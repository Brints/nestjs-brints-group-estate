import { forwardRef, Module } from '@nestjs/common';
import { LoginAttemptsService } from './providers/login-attempts.service';
import { LoginAttemptsController } from './login-attempts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoginAttempts } from './entities/login-attempt.entity';
import { LoginAttemptsProvider } from './providers/login-attempts.provider';
import { UsersModule } from 'src/users/users.module';

@Module({
  controllers: [LoginAttemptsController],
  providers: [LoginAttemptsService, LoginAttemptsProvider],
  imports: [
    forwardRef(() => UsersModule),
    TypeOrmModule.forFeature([LoginAttempts]),
  ],
  exports: [TypeOrmModule, LoginAttemptsProvider],
})
export class LoginAttemptsModule {}
