import { HttpStatus, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { UserAuth } from '../entities/userAuth.entity';
import { VerifyEmailDto } from '../dto/verify-email.dto';
import { CustomException } from 'src/exceptions/custom.exception';
import { VerificationStatus } from 'src/enums/roles.model';

@Injectable()
export class VerifyEmailProvider {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(UserAuth)
    private readonly userAuthRepository: Repository<UserAuth>,
  ) {}

  public async verifyUserEmail(verifyEmailDto: VerifyEmailDto) {
    const user = await this.userRepository.findOne({
      where: { email: verifyEmailDto.email },
      relations: { user_auth: true },
    });

    if (!user)
      throw new CustomException(HttpStatus.NOT_FOUND, 'User does not exist.');

    const userAuth = await this.userAuthRepository.findOne({
      where: { id: user.user_auth.id },
    });

    if (!userAuth)
      throw new CustomException(HttpStatus.NOT_FOUND, 'Item does not exist.');

    if (user.isVerified && user.user_auth.isEmailVerified)
      throw new CustomException(
        HttpStatus.BAD_REQUEST,
        'User is already verified.',
      );

    if (
      user.user_auth.emailVerificationToken !==
      verifyEmailDto.email_verification_token
    )
      throw new CustomException(
        HttpStatus.FORBIDDEN,
        'Invalid email verification token',
      );

    if (
      userAuth.emailVerificationTokenExpiresIn &&
      userAuth.emailVerificationTokenExpiresIn < new Date()
    ) {
      userAuth.email_status = VerificationStatus.EXPIRED;
      await this.userAuthRepository.save(userAuth);
    }

    if (userAuth.email_status === 'expired')
      throw new CustomException(
        HttpStatus.BAD_REQUEST,
        'Email verification token has expired. Please, generate a new one.',
      );

    userAuth.isEmailVerified = true;
    userAuth.emailVerificationToken = null;
    userAuth.emailVerificationTokenExpiresIn = null;
    userAuth.email_status = null;

    if (userAuth.isEmailVerified && userAuth.isPhoneNumberVerified)
      userAuth.status = VerificationStatus.VERIFIED;

    await this.userAuthRepository.save(userAuth);

    user.isVerified =
      userAuth.status === VerificationStatus.VERIFIED ? true : false;

    await this.userRepository.save(user);

    // TODO: Send success email
  }
}
