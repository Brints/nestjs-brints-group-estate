import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { VerifyPhoneNumberDto } from '../dto/verify-phone-number.dto';
import { User } from '../entities/user.entity';
import { UserAuth } from '../entities/userAuth.entity';
import { CustomException } from '../../exceptions/custom.exception';
import { VerificationStatus } from '../../enums/status.enum';
import { MailgunService } from 'src/services/email-service/mailgun-service/providers/mailgun.service';
import { AwsSmsService } from 'src/services/sms-service/providers/aws-sms.service';

@Injectable()
export class VerifyPhoneNumberProvider {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(UserAuth)
    private readonly userAuthRepository: Repository<UserAuth>,

    private readonly mailgunService: MailgunService,

    private readonly awsSmsService: AwsSmsService,
  ) {}

  public async verifyPhoneNumber(verifyPhoneNumberDto: VerifyPhoneNumberDto) {
    const user = await this.userRepository.findOne({
      where: { phone_number: verifyPhoneNumberDto.phone_number },
      relations: { user_auth: true },
    });

    if (!user)
      throw new CustomException(
        HttpStatus.NOT_FOUND,
        'Phone number does not exist.',
      );

    const userAuth = await this.userAuthRepository.findOne({
      where: { id: user.user_auth.id },
    });

    if (!userAuth)
      throw new CustomException(
        HttpStatus.BAD_REQUEST,
        'User Auth does not exist.',
      );

    if (user.phone_number !== verifyPhoneNumberDto.phone_number)
      throw new CustomException(
        HttpStatus.BAD_REQUEST,
        'Incorrect phone number.',
      );

    if (user.isVerified && user.user_auth.isPhoneNumberVerified)
      throw new CustomException(
        HttpStatus.FORBIDDEN,
        'This account is already verified.',
      );

    if (userAuth.otp !== Number(verifyPhoneNumberDto.otp))
      throw new CustomException(
        HttpStatus.BAD_REQUEST,
        'Invalid OTP. Try again.',
      );

    if (userAuth.otpExpiresIn && userAuth.otpExpiresIn < new Date()) {
      userAuth.otp_status = VerificationStatus.EXPIRED;
      await this.userAuthRepository.save(userAuth);
    }

    if (userAuth.otp_status === 'expired')
      throw new CustomException(
        HttpStatus.BAD_REQUEST,
        'OTP has expired. Please, generate a new one.',
      );

    userAuth.isPhoneNumberVerified = true;
    userAuth.otp = null;
    userAuth.otpExpiresIn = null;
    userAuth.otp_status = VerificationStatus.VERIFIED;

    if (userAuth.isEmailVerified && userAuth.isPhoneNumberVerified)
      userAuth.status = VerificationStatus.VERIFIED;

    await this.userAuthRepository.save(userAuth);

    user.isVerified =
      userAuth.status === VerificationStatus.VERIFIED ? true : false;

    await this.userRepository.save(user);

    await this.awsSmsService.sendVerificationSuccess(user);

    if (user.isVerified) {
      await this.mailgunService.sendWelcomeEmail(user);
    }
  }
}
