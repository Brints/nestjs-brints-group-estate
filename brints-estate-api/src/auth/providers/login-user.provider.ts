import { forwardRef, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { User } from '../../users/entities/user.entity';
import { HashingProvider } from './hashing.provider';
import { LoginUserDto } from '../dto/login.dto';
import { CustomException } from '../../exceptions/custom.exception';
import { GenerateTokensProvider } from './generate-tokens.provider';
import { AccountStatus } from '../../enums/account-status.enum';
import { LoginAttemptsProvider } from '../../login-attempts/providers/login-attempts.provider';
import { LoginAttempts } from 'src/login-attempts/entities/login-attempt.entity';

@Injectable()
export class LoginUserProvider {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(LoginAttempts)
    private readonly loginAttemptsRepository: Repository<LoginAttempts>,

    @Inject(forwardRef(() => HashingProvider))
    private readonly hashingProvider: HashingProvider,

    private readonly generateTokensProvider: GenerateTokensProvider,

    private readonly loginAttemptsProvider: LoginAttemptsProvider,
  ) {}

  public async loginUser(loginUserDto: LoginUserDto) {
    const user = await this.userRepository.findOne({
      where: { email: loginUserDto.email },
      relations: { login_attempts: true },
    });

    if (!user) {
      throw new CustomException(HttpStatus.NOT_FOUND, 'User not found');
    }

    const loginAttempts = await this.loginAttemptsRepository.findOne({
      where: { id: user.login_attempts.id },
    });

    if (!loginAttempts) {
      throw new CustomException(
        HttpStatus.NOT_FOUND,
        'Login attempts does not exist.',
      );
    }

    if (
      loginAttempts.isBlocked &&
      loginAttempts.blockedUntil &&
      loginAttempts.blockedUntil > new Date()
    ) {
      await this.loginAttemptsProvider.attemptedLoginWhileBlocked(user);
    }

    if (
      loginAttempts.isBlocked &&
      loginAttempts.blockedUntil &&
      loginAttempts.blockedUntil < new Date()
    ) {
      await this.loginAttemptsProvider.resetLoginAttempts(
        user,
        user.login_attempts,
      );
    }

    const passwordMatch: boolean = await this.hashingProvider.comparePassword(
      loginUserDto.password,
      user.password,
    );

    if (!passwordMatch) {
      await this.loginAttemptsProvider.blockUser(user);
    }

    if (!user.isVerified) {
      throw new CustomException(
        HttpStatus.BAD_REQUEST,
        'User account not yet verified',
      );
    }

    if (
      user.account_status === AccountStatus.BLOCKED ||
      user.account_status === AccountStatus.SUSPENDED
    )
      throw new CustomException(
        HttpStatus.FORBIDDEN,
        'Your account has been blocked or suspended. Contact admin.',
      );

    if (user.account_status !== AccountStatus.ACTIVE) {
      user.account_status = AccountStatus.ACTIVE;
      await this.userRepository.save(user);
    }

    user.last_login = new Date();
    await this.userRepository.save(user);

    await this.loginAttemptsProvider.resetLoginAttemptData(user);

    const tokens = await this.generateTokensProvider.generateTokens(user);

    return { user, tokens };
  }
}
