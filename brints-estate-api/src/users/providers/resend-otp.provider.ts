import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../entities/user.entity';
import { UserAuth } from '../entities/userAuth.entity';
import { GenerateTokenHelper } from '../../utils/generate-token.lib';
import { GenerateNewOTPDto } from '../dto/generate-new-otp.dto';
import { CustomException } from '../../exceptions/custom.exception';
import { VerificationStatus } from '../../enums/status.enum';
import { MailgunService } from '../../services/email-service/mailgun-service/providers/mailgun.service';
import { AwsSmsService } from 'src/services/sms-service/providers/aws-sms.service';

@Injectable()
export class ResendOtpProvider {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(UserAuth)
    private readonly userAuthRepository: Repository<UserAuth>,

    private readonly generateTokenHelper: GenerateTokenHelper,

    private readonly mailgunService: MailgunService,

    private readonly awsSmsService: AwsSmsService,
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
    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 20);

    userAuth.otp = Number(otp);
    userAuth.otpExpiresIn = otpExpiry;
    userAuth.otp_status = VerificationStatus.PENDING;
    await this.userAuthRepository.save(userAuth);
    await this.userRepository.save(user);

    await this.awsSmsService.sendOTPSms(user, userAuth);
    await this.mailgunService.sendOTP(user, userAuth);
  }
}
