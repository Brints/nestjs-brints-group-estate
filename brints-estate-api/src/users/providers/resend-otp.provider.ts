import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../entities/user.entity';
import { UserAuth } from '../entities/userAuth.entity';
import { GenerateTokenHelper } from '../../utils/generate-token.lib';
import { GenerateNewOTPDto } from '../dto/generate-new-otp.dto';
import { CustomException } from '../../exceptions/custom.exception';
import { VerificationStatus } from '../../enums/status.enum';
import { AwsSmsService } from 'src/messaging/sms/providers/aws-sms.service';
import { TimeHelper } from 'src/utils/time-helper.lib';

@Injectable()
export class ResendOtpProvider {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(UserAuth)
    private readonly userAuthRepository: Repository<UserAuth>,

    private readonly generateTokenHelper: GenerateTokenHelper,

    private readonly awsSmsService: AwsSmsService,

    private readonly timeHelper: TimeHelper,
  ) {}

  public async resendOTP(generateNewOTPDto: GenerateNewOTPDto): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { email: generateNewOTPDto.email },
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
        'Server error. Please try again.',
      );

    const otp = this.generateTokenHelper.generateOTP(6);
    const otpExpiry = this.timeHelper.setExpiryDate('minutes', 20);

    userAuth.otp = Number(otp);
    userAuth.otpExpiresIn = otpExpiry;
    userAuth.otp_status = VerificationStatus.PENDING;
    await this.userAuthRepository.save(userAuth);
    await this.userRepository.save(user);

    await this.awsSmsService.sendOTPSms(user, userAuth);
  }
}
