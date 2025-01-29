import { forwardRef, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../entities/user.entity';
import { UserAuth } from '../entities/userAuth.entity';
import { HashingProvider } from '../../auth/providers/hashing.provider';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { CustomException } from '../../exceptions/custom.exception';
import { AccountStatus } from '../../enums/account-status.enum';
import { MailgunService } from 'src/messaging/email/mailgun-service/providers/mailgun.service';
import { IResetPassword } from '../interface/reset-password.interface';

@Injectable()
export class ResetPasswordProvider {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(UserAuth)
    private readonly userAuthRepository: Repository<UserAuth>,

    @Inject(forwardRef(() => HashingProvider))
    private readonly hashingProvider: HashingProvider,

    private readonly mailgunService: MailgunService,
  ) {}

  public async resetPassword(
    params: IResetPassword,
    resetPasswordDto: ResetPasswordDto,
  ): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { email: params.email },
      relations: { user_auth: true },
    });

    if (!user)
      throw new CustomException(HttpStatus.NOT_FOUND, 'User does not exist.');

    if (!user.isVerified)
      throw new CustomException(
        HttpStatus.FORBIDDEN,
        'Verify your account first.',
      );

    if (
      user.account_status === AccountStatus.BLOCKED ||
      user.account_status === AccountStatus.SUSPENDED
    )
      throw new CustomException(
        HttpStatus.FORBIDDEN,
        'Your account is suspended or block. Please, contact the admin.',
      );

    if (resetPasswordDto.new_password !== resetPasswordDto.confirm_password)
      throw new CustomException(
        HttpStatus.BAD_REQUEST,
        'Passwords do not match.',
      );

    const userAuth = await this.userAuthRepository.findOne({
      where: { id: user.user_auth.id },
    });

    if (!userAuth)
      throw new CustomException(
        HttpStatus.NOT_FOUND,
        'User Auth does not exist',
      );

    if (userAuth.passwordResetToken !== params.token)
      throw new CustomException(
        HttpStatus.BAD_REQUEST,
        'Invalid reset password token.',
      );

    if (
      userAuth.passwordResetTokenExpiresIn &&
      userAuth.passwordResetTokenExpiresIn < new Date()
    )
      throw new CustomException(
        HttpStatus.BAD_REQUEST,
        'Password reset token has expired.',
      );

    const isOldPassword = await this.hashingProvider.comparePassword(
      resetPasswordDto.new_password,
      user.password as string,
    );

    if (isOldPassword)
      throw new CustomException(
        HttpStatus.FORBIDDEN,
        'Your new password cannot be same as the old password',
      );

    const hashedPassword = await this.hashingProvider.hashPassword(
      resetPasswordDto.new_password,
    );

    user.password = hashedPassword;
    userAuth.passwordResetToken = null;
    userAuth.passwordResetTokenExpiresIn = null;

    await this.userAuthRepository.save(userAuth);
    await this.userRepository.save(user);

    await this.mailgunService.sendResetPasswordConfirmation(user);
  }
}
