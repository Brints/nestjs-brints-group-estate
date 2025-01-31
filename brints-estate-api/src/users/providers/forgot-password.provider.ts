import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../entities/user.entity';
import { MailgunService } from '../../messaging/email/mailgun-service/providers/mailgun.service';
import { UserAuth } from '../entities/userAuth.entity';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { CustomException } from '../../exceptions/custom.exception';
import { GenerateTokenHelper } from '../../utils/generate-token.lib';
import { TimeHelper } from 'src/utils/time-helper.lib';

@Injectable()
export class ForgotPasswordProvider {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(UserAuth)
    private readonly userAuthRepository: Repository<UserAuth>,

    private readonly mailgunService: MailgunService,

    private readonly generateTokenHelper: GenerateTokenHelper,

    private readonly timeHelper: TimeHelper,
  ) {}

  public async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.userRepository.findOne({
      where: { email: forgotPasswordDto.email },
      relations: { user_auth: true },
    });

    if (!user)
      throw new CustomException(HttpStatus.NOT_FOUND, 'User does not exist');

    const userAuth = await this.userAuthRepository.findOne({
      where: { id: user.user_auth.id },
    });

    if (!userAuth)
      throw new CustomException(
        HttpStatus.NOT_FOUND,
        'User Auth does not exist',
      );

    if (
      !user.isVerified ||
      !userAuth.isEmailVerified ||
      !userAuth.isPhoneNumberVerified
    )
      throw new CustomException(
        HttpStatus.FORBIDDEN,
        'Your account is not yet verified',
      );

    if (
      userAuth.passwordResetTokenExpiresIn &&
      userAuth.passwordResetTokenExpiresIn > new Date()
    )
      throw new CustomException(
        HttpStatus.FORBIDDEN,
        `You have an active token. Try again after ${this.timeHelper.getTimeLeft(userAuth.passwordResetTokenExpiresIn, 'hour')}`,
      );

    const resetPaswordToken =
      this.generateTokenHelper.generateVerificationToken();

    const resetPasswordTokenExpiry = this.timeHelper.setExpiryDate('hour', 1);

    userAuth.passwordResetToken = resetPaswordToken;
    userAuth.passwordResetTokenExpiresIn = resetPasswordTokenExpiry;

    await this.userAuthRepository.save(userAuth);
    await this.userRepository.save(user);

    // TODO: send reset password link to email
    await this.mailgunService.sendPasswordReset(user, userAuth);
  }
}
