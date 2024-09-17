import { HttpStatus, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { User } from 'src/users/entities/user.entity';
import { LoginAttempts } from '../entities/login-attempt.entity';
import { CustomException } from '../../exceptions/custom.exception';

@Injectable()
export class LoginAttemptsProvider {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(LoginAttempts)
    private readonly loginAttemptsRepository: Repository<LoginAttempts>,
  ) {}

  private async isUserBlocked(user: User): Promise<boolean> {
    if (!user)
      throw new CustomException(HttpStatus.NOT_FOUND, 'User does not exist.');

    if (user.login_attempts.isBlocked) return true;

    return false;
  }

  public async resetLoginAttempts(user: User): Promise<void> {
    if (!user)
      throw new CustomException(HttpStatus.NOT_FOUND, 'User does not exist.');

    const loginAttempts = await this.loginAttemptsRepository.findOne({
      where: { id: user.login_attempts.id },
    });

    if (!loginAttempts)
      throw new CustomException(
        HttpStatus.NOT_FOUND,
        'Login attempts does not exist.',
      );

    // if (user.login_attempts.isBlocked && user.login_attempts.blockedUntil) {
    //   const current_date = new Date();
    //   if (current_date > user.login_attempts.blockedUntil) {
    loginAttempts.isBlocked = false;
    loginAttempts.blockedUntil = null;
    await this.loginAttemptsRepository.save(loginAttempts);
    await this.userRepository.save(user);
    //   }
    // }
  }

  public async blockUser(user: User): Promise<void> {
    if (!user)
      throw new CustomException(HttpStatus.NOT_FOUND, 'User does not exist.');

    const loginAttempts = await this.loginAttemptsRepository.findOne({
      where: { id: user.login_attempts.id },
    });

    if (!loginAttempts)
      throw new CustomException(
        HttpStatus.NOT_FOUND,
        'Login attempts does not exist.',
      );

    const MAX_LOGIN_ATTEMPTS = 5;
    const BLOCK_DURATION = 4 * 24 * 60 * 60 * 1000; // 4 days

    if (!loginAttempts.isBlocked) {
      loginAttempts.login_attempts = Number(loginAttempts.login_attempts) + 1;
      await this.loginAttemptsRepository.save(loginAttempts);

      if (loginAttempts.login_attempts >= MAX_LOGIN_ATTEMPTS) {
        loginAttempts.isBlocked = true;
        loginAttempts.blockedUntil = new Date(
          new Date().getTime() + BLOCK_DURATION,
        );
        await this.loginAttemptsRepository.save(loginAttempts);
      }
    }

    const attempts = loginAttempts.login_attempts;
    const remaining_attempts = MAX_LOGIN_ATTEMPTS - attempts;
    const attempts_message =
      remaining_attempts === 1
        ? `Invalid login credentials. You have ${remaining_attempts} attempt left.`
        : `Invalid login credentials. You have ${remaining_attempts} attempts left.`;

    const blockedUntil = loginAttempts.blockedUntil;
    let daysRemaining: number = 0;
    if (blockedUntil) {
      const current_date = new Date();
      const timeDiff = blockedUntil.getTime() - current_date.getTime();
      daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));
    }

    const daysRemainingMessage =
      daysRemaining > 1
        ? `Your account has been blocked. Try again in ${daysRemaining} days`
        : `Your account has been blocked. Try again in ${daysRemaining} day`;

    const blocked_message =
      attempts >= MAX_LOGIN_ATTEMPTS ? daysRemainingMessage : attempts_message;

    throw new CustomException(HttpStatus.BAD_REQUEST, blocked_message);
  }

  public async attemptedLoginWhileBlocked(user: User): Promise<void> {
    if (!user)
      throw new CustomException(HttpStatus.NOT_FOUND, 'User does not exist.');

    const isBlocked = await this.isUserBlocked(user);

    if (isBlocked) {
      const current_date = new Date();
      if (
        user.login_attempts.blockedUntil &&
        current_date < user.login_attempts.blockedUntil
      ) {
        const blockedUntil = user.login_attempts.blockedUntil;
        const timeDiff = blockedUntil.getTime() - current_date.getTime();

        const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));

        const message =
          daysRemaining === 1
            ? `Login access blocked. Try again in ${daysRemaining} day.`
            : `Login access blocked. Try again in ${daysRemaining} days.`;

        throw new CustomException(HttpStatus.UNAUTHORIZED, message);
      }
    }
  }

  public async resetLoginAttemptData(user: User): Promise<void> {
    if (!user)
      throw new CustomException(HttpStatus.NOT_FOUND, 'User not found.');

    const loginAttempts = await this.loginAttemptsRepository.findOne({
      where: { id: user.login_attempts.id },
    });

    if (!loginAttempts)
      throw new CustomException(HttpStatus.BAD_REQUEST, 'Not available');

    loginAttempts.login_attempts = 0;
    loginAttempts.blockedUntil = null;
    loginAttempts.isBlocked = false;

    await this.loginAttemptsRepository.save(loginAttempts);
  }
}
