import { forwardRef, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
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
import { CreateLoginAttemptDto } from 'src/login-attempts/dto/create-login-attempt.dto';
import { LoginAttempts } from 'src/login-attempts/entities/login-attempt.entity';
import { MailgunService } from 'src/services/email-service/mailgun-service/providers/mailgun.service';

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
    const verificationTokenExpiry = new Date();
    verificationTokenExpiry.setHours(verificationTokenExpiry.getHours() + 1);

    const newOtp = this.generateTokenHelper.generateOTP(6);
    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 20);

    const emailVerificationToken = verificationToken;
    const emailVerificationTokenExpiresIn = verificationTokenExpiry;

    const otpExpiresIn = otpExpiry;

    const isEmailVerified = false;
    const isPhoneNumberVerified = false;
    const status = VerificationStatus.PENDING;

    const userAuth = this.userAuthRepository.create({
      ...createUserAuthDto,
      emailVerificationToken,
      emailVerificationTokenExpiresIn,
      otp: Number(newOtp),
      otpExpiresIn,
      isEmailVerified,
      isPhoneNumberVerified,
      status,
    });

    const loginAttempts = this.loginAttemptsRepository.create(loginAttemptsDto);

    const user = this.userRepository.create({
      ...CreateUserDto,
      image_url: file_path,
      first_name: formattedFirstName,
      last_name: formattedLastName,
      email: createUserDto.email.toLowerCase(),
      phone_number: fullPhoneNumber,
      password: await this.hashingProvider.hashPassword(createUserDto.password),
      gender: createUserDto.gender,
      role: user_role,
      privacy_policy: createUserDto.privacy_policy,
      terms_and_conditions: createUserDto.terms_and_conditions,
      marketing: createUserDto.marketing,
    });

    user.user_auth = userAuth;
    user.login_attempts = loginAttempts;

    await this.userAuthRepository.save(userAuth);
    await this.loginAttemptsRepository.save(loginAttempts);
    await this.userRepository.save(user);

    await this.mailgunService.sendOTP(user, userAuth);
    await this.mailgunService.sendVerificationTokenEmail(user, userAuth);

    return user;
  }
}
