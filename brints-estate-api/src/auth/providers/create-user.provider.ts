import { forwardRef, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { User } from 'src/users/entities/user.entity';
import { UserAuth } from 'src/users/entities/userAuth.entity';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { CreateUserAuthDto } from 'src/users/dto/create-userauth.dto';
import { CustomException } from 'src/exceptions/custom.exception';
import { UserHelper } from 'src/utils/userHelper.lib';
import { HashingProvider } from './hashing.provider';
import { UserRole, VerificationStatus } from 'src/enums/roles.model';
import { GenerateTokenHelper } from 'src/utils/generate-token.lib';
import { UploadToAwsProvider } from 'src/uploads/providers/upload-to-aws.provider';
import { AppConfigService } from 'src/config/config.service';

@Injectable()
export class CreateUserProvider {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(UserAuth)
    private readonly userAuthRepository: Repository<UserAuth>,

    @Inject(forwardRef(() => HashingProvider))
    private readonly hashingProvider: HashingProvider,

    @Inject(forwardRef(() => UserHelper))
    private readonly userHelper: UserHelper,

    @Inject(forwardRef(() => GenerateTokenHelper))
    private readonly generateTokenHelper: GenerateTokenHelper,

    private readonly uploadToAwsProvider: UploadToAwsProvider,

    private readonly appConfigService: AppConfigService,
  ) {}

  public async createUser(
    createUserDto: CreateUserDto,
    createUserAuthDto: CreateUserAuthDto,
    file: Express.Multer.File,
  ): Promise<User> {
    const {
      first_name,
      last_name,
      email,
      password,
      confirm_password,
      phone_number,
      gender,
      country_code,
    } = createUserDto;

    if (gender.toLowerCase() !== 'female' && gender.toLowerCase() !== 'male') {
      throw new CustomException(
        HttpStatus.BAD_REQUEST,
        `${gender} is not a valid gender`,
      );
    }

    if (!country_code.startsWith('+')) {
      throw new CustomException(
        HttpStatus.BAD_REQUEST,
        'Country code must start with a + followed by a number',
      );
    }

    const fullPhoneNumber = this.userHelper.formatPhoneNumber(
      country_code,
      phone_number,
    );

    if (password !== confirm_password) {
      throw new CustomException(
        HttpStatus.BAD_REQUEST,
        'Passwords do not match. Please try again',
      );
    }

    if (password === email) {
      throw new CustomException(
        HttpStatus.BAD_REQUEST,
        'Password cannot be the same as email',
      );
    }

    const formattedFirstName =
      this.userHelper.capitalizeFirstLetter(first_name);
    const formattedLastName = this.userHelper.capitalizeFirstLetter(last_name);

    const userExists = await this.userRepository.findOne({
      where: { email: email.toLowerCase() },
    });
    if (userExists) {
      throw new CustomException(
        HttpStatus.CONFLICT,
        'User Exists already. Please login',
      );
    }

    const phoneNumberExists = await this.userRepository.findOne({
      where: { phone_number: fullPhoneNumber },
    });
    if (phoneNumberExists) {
      throw new CustomException(
        HttpStatus.CONFLICT,
        'Phone number Exists already. Use another phone number',
      );
    }

    const users = await this.userRepository.find();
    const user_role = users.length === 0 ? UserRole.SUPER_ADMIN : UserRole.USER;

    let file_path;
    if (file) {
      const image_url = await this.uploadToAwsProvider.fileUpload(file);
      file_path = `https://${this.appConfigService.getConfig().aws.aws_cloudfront_url}/${image_url}`;
    }

    const verificationToken =
      this.generateTokenHelper.generateVerificationToken();
    const verificationTokenExpiry = new Date();
    verificationTokenExpiry.setHours(verificationTokenExpiry.getHours() + 1);

    const newOtp = this.generateTokenHelper.generateOTP(6);
    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 20);

    const emailVerificationToken = verificationToken;
    const emailVerificationTokenExpiresIn = verificationTokenExpiry;

    const otp = parseInt(newOtp);
    const otpExpiresIn = otpExpiry;

    const isEmailVerified = false;
    const isPhoneNumberVerified = false;
    const status = VerificationStatus.PENDING;

    const userAuth = this.userAuthRepository.create({
      ...createUserAuthDto,
      emailVerificationToken,
      emailVerificationTokenExpiresIn,
      otp,
      otpExpiresIn,
      isEmailVerified,
      isPhoneNumberVerified,
      status,
    });

    const user = this.userRepository.create({
      ...CreateUserDto,
      image_url: file_path,
      first_name: formattedFirstName,
      last_name: formattedLastName,
      email: email.toLowerCase(),
      phone_number: fullPhoneNumber,
      password: await this.hashingProvider.hashPassword(password),
      gender,
      role: user_role,
    });

    user.user_auth = userAuth;

    await this.userAuthRepository.save(userAuth);
    await this.userRepository.save(user);

    return user;
  }
}
