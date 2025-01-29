import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { UpdateUserDto } from '../dto/update-user.dto';
import { CustomException } from 'src/exceptions/custom.exception';
import { UploadToAwsProvider } from 'src/uploads/providers/upload-to-aws.provider';
import { IActiveUser } from 'src/auth/interfaces/active-user.interface';
import { UserHelper } from 'src/utils/userHelper.lib';
import { UserAuth } from '../entities/userAuth.entity';
import { GenerateTokenHelper } from 'src/utils/generate-token.lib';
import { TimeHelper } from 'src/utils/time-helper.lib';
import { VerificationStatus } from 'src/enums/status.enum';
import { AwsSmsService } from 'src/messaging/sms/providers/aws-sms.service';

@Injectable()
export class UpdateUserProvider {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(UserAuth)
    private readonly userAuthRepository: Repository<UserAuth>,

    private readonly uploadToAwsProvider: UploadToAwsProvider,

    private readonly userHelper: UserHelper,

    private readonly awsSmsService: AwsSmsService,

    private readonly generateTokenHelper: GenerateTokenHelper,

    private readonly timeHelper: TimeHelper,
  ) {}

  public async update(
    updateUserDto: UpdateUserDto,
    userId: string,
    activeUser: IActiveUser,
    file: Express.Multer.File | null,
  ): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['user_auth'],
    });

    if (!user)
      throw new CustomException(HttpStatus.NOT_FOUND, 'User not found');

    const userAuth = await this.userAuthRepository.findOne({
      where: { id: user.user_auth.id },
    });

    if (!userAuth)
      throw new CustomException(HttpStatus.NOT_FOUND, 'User Auth not found');

    if (user.id !== activeUser.sub)
      throw new CustomException(
        HttpStatus.FORBIDDEN,
        'You are not allowed to perform this action',
      );

    user.first_name = updateUserDto.first_name ?? user.first_name;
    user.last_name = updateUserDto.last_name ?? user.last_name;
    user.gender = updateUserDto.gender ?? user.gender;
    user.marketing_consent =
      updateUserDto.marketing_consent ?? user.marketing_consent;

    await this.userRepository.update(user.id, user);

    if (file) {
      const fileUrl = await this.uploadToAwsProvider.fileUpload(file);
      user.image_url = fileUrl;
      //await this.uploadToAwsProvider.deleteFile(user.image_url);
      await this.userRepository.update(user.id, { image_url: fileUrl });
    }

    if (updateUserDto.phone_number) {
      const newPhoneNumber = this.userHelper.formatPhoneNumber(
        updateUserDto.country_code,
        updateUserDto.phone_number,
      );
      const phoneNumberExists = await this.userRepository.findOneBy({
        phone_number: newPhoneNumber,
      });
      if (phoneNumberExists)
        throw new CustomException(
          HttpStatus.CONFLICT,
          'Phone number already in use.',
        );

      await this.userRepository.update(user.id, {
        phone_number: newPhoneNumber,
      });

      const otp = this.generateTokenHelper.generateOTP(6);
      const otpExpiresIn = this.timeHelper.setExpiryDate('minute', 20);

      userAuth.isPhoneNumberVerified = false;
      userAuth.otp_status = VerificationStatus.PENDING;

      userAuth.otp = Number(otp);
      userAuth.otpExpiresIn = otpExpiresIn;
      await this.userAuthRepository.save(userAuth);

      await this.awsSmsService.sendPhoneNumberUpdateOTPSms(
        newPhoneNumber,
        user,
        userAuth,
      );
    }

    return user;
  }
}
