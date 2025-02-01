import { forwardRef, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { User } from '../../users/entities/user.entity';
import { UserAuth } from '../../users/entities/userAuth.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { CreateUserAuthDto } from '../dto/create-userauth.dto';
import { CustomException } from '../../exceptions/custom.exception';
import { UserHelper } from '../../utils/userHelper.lib';
import { HashingProvider } from './hashing.provider';
import { UserRole } from '../../enums/user-role.enum';
import { VerificationStatus } from '../../enums/status.enum';
import { GenerateTokenHelper } from '../../utils/generate-token.lib';
import { UploadToAwsProvider } from '../../uploads/providers/upload-to-aws.provider';
import { AppConfigService } from '../../config/config.service';
import { CreateLoginAttemptDto } from '../../login-attempts/dto/create-login-attempt.dto';
import { LoginAttempts } from '../../login-attempts/entities/login-attempt.entity';
import { MailgunService } from '../../messaging/email/mailgun-service/providers/mailgun.service';
import { TimeHelper } from 'src/utils/time-helper.lib';
import { AwsSmsService } from 'src/messaging/sms/providers/aws-sms.service';

@Injectable()
export class CreateUserProvider {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(UserAuth)
    private readonly userAuthRepository: Repository<UserAuth>,

    @InjectRepository(LoginAttempts)
    private readonly loginAttemptsRepository: Repository<LoginAttempts>,

    @Inject(forwardRef(() => HashingProvider))
    private readonly hashingProvider: HashingProvider,

    @Inject(forwardRef(() => UserHelper))
    private readonly userHelper: UserHelper,

    @Inject(forwardRef(() => GenerateTokenHelper))
    private readonly generateTokenHelper: GenerateTokenHelper,

    private readonly uploadToAwsProvider: UploadToAwsProvider,

    private readonly appConfigService: AppConfigService,

    private readonly dataSource: DataSource,

    private readonly mailgunService: MailgunService,

    private readonly timeHelper: TimeHelper,

    private readonly awsSmsService: AwsSmsService,
  ) {}

  public async createUser(
    createUserDto: CreateUserDto,
    createUserAuthDto: CreateUserAuthDto,
    loginAttemptsDto: CreateLoginAttemptDto,
    file: Express.Multer.File,
  ): Promise<User> {
    if (createUserDto.terms_and_conditions !== true)
      throw new CustomException(
        HttpStatus.FORBIDDEN,
        'Accept Terms and Conditions before you proceed.',
      );

    if (createUserDto.privacy_policy !== true)
      throw new CustomException(
        HttpStatus.FORBIDDEN,
        'Accept Privacy before you proceed.',
      );

    this.userHelper.convertGenderToLowerCase(createUserDto.gender);

    const fullPhoneNumber = this.userHelper.formatPhoneNumber(
      createUserDto.country_code,
      createUserDto.phone_number,
    );

    this.userHelper.comparePasswords(
      createUserDto.password,
      createUserDto.confirm_password,
    );

    if (createUserDto.password === createUserDto.email) {
      throw new CustomException(
        HttpStatus.BAD_REQUEST,
        'Password cannot be the same as email',
      );
    }

    const formattedFirstName = this.userHelper.capitalizeFirstLetter(
      createUserDto.first_name,
    );
    const formattedLastName = this.userHelper.capitalizeFirstLetter(
      createUserDto.last_name,
    );

    const userExists = await this.userRepository.findOne({
      where: { email: createUserDto.email.toLowerCase() },
    });
    if (userExists) {
      throw new CustomException(
        HttpStatus.CONFLICT,
        'User already registered. Please login',
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

    let user_role;
    await this.dataSource.transaction(async (manager) => {
      const superAdmin = await manager.findOne(User, {
        where: { role: UserRole.SUPER_ADMIN },
      });

      user_role = superAdmin ? UserRole.USER : UserRole.SUPER_ADMIN;
    });

    let file_path;
    if (file) {
      const image_url = await this.uploadToAwsProvider.fileUpload(file);
      file_path = `https://${this.appConfigService.getConfig().aws.aws_cloudfront_url}/${image_url}`;
    }

    const verificationToken =
      this.generateTokenHelper.generateVerificationToken();
    const verificationTokenExpiry = this.timeHelper.setExpiryDate('hours', 3);

    const newOtp = this.generateTokenHelper.generateOTP(6);
    const otpExpiry = this.timeHelper.setExpiryDate('minutes', 20);

    const emailVerificationToken = verificationToken;
    const emailVerificationTokenExpiresIn = verificationTokenExpiry;

    const userAuth = this.userAuthRepository.create({
      ...createUserAuthDto,
      emailVerificationToken,
      emailVerificationTokenExpiresIn,
      otp: Number(newOtp),
      otpExpiresIn: otpExpiry,
      isEmailVerified: false,
      isPhoneNumberVerified: false,
      status: VerificationStatus.PENDING,
    });

    const loginAttempts = this.loginAttemptsRepository.create(loginAttemptsDto);

    const hashedPassword = await this.hashingProvider.hashPassword(
      createUserDto.password,
    );

    const user = this.userRepository.create({
      ...CreateUserDto,
      image_url: file_path,
      first_name: formattedFirstName,
      last_name: formattedLastName,
      email: createUserDto.email.toLowerCase(),
      phone_number: fullPhoneNumber,
      password: hashedPassword,
      gender: createUserDto.gender,
      role: user_role,
      privacy_policy: createUserDto.privacy_policy,
      terms_and_conditions: createUserDto.terms_and_conditions,
      marketing_consent: createUserDto.marketing_consent,
    });

    user.user_auth = userAuth;
    user.login_attempts = loginAttempts;

    await this.mailgunService.sendVerificationTokenEmail(user, userAuth);
    await this.awsSmsService.sendOTPSms(user, userAuth);
    await this.mailgunService.sendOTP(user, userAuth);

    await this.userAuthRepository.save(userAuth);
    await this.loginAttemptsRepository.save(loginAttempts);
    await this.userRepository.save(user);

    return user;
  }
}
