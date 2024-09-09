import { HttpStatus, Injectable } from '@nestjs/common';
import { VerifyPhoneNumberDto } from '../dto/verify-phone-number.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { UserAuth } from '../entities/userAuth.entity';
import { CustomException } from 'src/exceptions/custom.exception';
import { VerificationStatus } from 'src/enums/roles.model';

@Injectable()
export class VerifyPhoneNumberProvider {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(UserAuth)
    private readonly userAuthRepository: Repository<UserAuth>,
  ) {}

  public async verifyPhoneNumber(verifyPhoneNumberDto: VerifyPhoneNumberDto) {
    const user = await this.userRepository.findOne({
      where: { phone_number: verifyPhoneNumberDto.phone_number },
      relations: { user_auth: true },
    });

    if (!user)
      throw new CustomException(
        HttpStatus.BAD_REQUEST,
        'Incorrect phone number.',
      );

    const userAuth = await this.userAuthRepository.findOne({
      where: { id: user.user_auth.id },
    });

    if (!userAuth)
      throw new CustomException(HttpStatus.BAD_REQUEST, 'Item does not exist.');

    if (user.isVerified && user.user_auth.isPhoneNumberVerified)
      throw new CustomException(
        HttpStatus.FORBIDDEN,
        'You are verified already',
      );

    if (user.user_auth.otp !== userAuth.otp)
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
    userAuth.otp_status = null;

    if (userAuth.isEmailVerified && userAuth.isPhoneNumberVerified)
      userAuth.status = VerificationStatus.VERIFIED;

    await this.userAuthRepository.save(userAuth);

    user.isVerified =
      userAuth.status === VerificationStatus.VERIFIED ? true : false;

    await this.userRepository.save(user);
  }
}
