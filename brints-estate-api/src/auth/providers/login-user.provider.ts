import { forwardRef, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { User } from '../../users/entities/user.entity';
import { HashingProvider } from './hashing.provider';
import { LoginUserDto } from '../dto/login.dto';
import { CustomException } from '../../exceptions/custom.exception';
import { GenerateTokensProvider } from './generate-tokens.provider';
import { AccountStatus } from '../../enums/roles.model';
import { LoginAttemptsProvider } from '../../login-attempts/providers/login-attempts.provider';

@Injectable()
export class LoginUserProvider {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @Inject(forwardRef(() => HashingProvider))
    private readonly hashingProvider: HashingProvider,

    private readonly generateTokensProvider: GenerateTokensProvider,

    private readonly loginAttemptsProvider: LoginAttemptsProvider,
  ) {}

  public async loginUser(
    loginUserDto: LoginUserDto,
  ): Promise<{ access_token: string }> {
    const user = await this.userRepository.findOne({
      where: { email: loginUserDto.email },
      relations: { login_attempts: true },
    });

    if (!user) {
      throw new CustomException(HttpStatus.NOT_FOUND, 'User not found');
    }

    if (
      user.login_attempts.isBlocked &&
      user.login_attempts.blockedUntil &&
      user.login_attempts.blockedUntil > new Date()
    ) {
      await this.loginAttemptsProvider.resetLoginAttempts(user);
    }

    if (
      user.login_attempts.isBlocked &&
      user.login_attempts.blockedUntil &&
      user.login_attempts.blockedUntil > new Date()
    ) {
      await this.loginAttemptsProvider.attemptedLoginWhileBlocked(user);
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

    await this.loginAttemptsProvider.resetLoginAttemptData(user);

    return await this.generateTokensProvider.generateTokens(user);
  }
}
