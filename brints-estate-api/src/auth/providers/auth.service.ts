import { HttpStatus, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { CreateUserAuthDto } from 'src/users/dto/create-userauth.dto';
import { User } from 'src/users/entities/user.entity';
import { UserAuth } from 'src/users/entities/userAuth.entity';
import {
  generateOTP,
  generateVerificationToken,
} from 'src/utils/generate-token.lib';
import { VerificationStatus } from 'src/enums/roles.model';
import { CustomConflictException } from 'src/exceptions/http-exception.filter';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserAuth)
    private readonly userAuthRepository: Repository<UserAuth>,
  ) {}

  public async createUser(
    createUserDto: CreateUserDto,
    createUserAuthDto: CreateUserAuthDto,
  ) {
    const {
      //   // first_name,
      //   // last_name,
      email,
      //   // password,
      //   // confirm_password,
      //   // gender,
      //   // phone_number,
      //   // role,
    } = createUserDto;

    const userExists = await this.userRepository.findOne({
      where: { email },
    });

    if (userExists) {
      throw new CustomConflictException(
        HttpStatus.CONFLICT,
        'User Exists already',
      );
    }

    const user = this.userRepository.create(createUserDto);
    const verificationToken = generateVerificationToken();
    const newOtp = generateOTP(6);
    const verificationTokenExpiry = new Date();
    verificationTokenExpiry.setHours(verificationTokenExpiry.getHours() + 1);
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
    user.user_auth = userAuth;
    userAuth.user = user;
    await this.userAuthRepository.save(userAuth);
    await this.userRepository.save(user);
    return user;
  }
}
