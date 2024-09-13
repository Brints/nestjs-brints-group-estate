import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { UserAuth } from '../entities/userAuth.entity';
import { GenerateTokenHelper } from 'src/utils/generate-token.lib';
import { GenerateNewEmailTokenDto } from '../dto/new-email-token.dto';
import { CustomException } from 'src/exceptions/custom.exception';
import { VerificationStatus } from 'src/enums/roles.model';
import { MailgunService } from 'src/services/email-service/mailgun-service/providers/mailgun.service';

@Injectable()
export class GenerateNewEmailVerificationProvider {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(UserAuth)
    private readonly userAuthRepository: Repository<UserAuth>,

    private readonly generateTokenHelper: GenerateTokenHelper,

    private readonly mailgunService: MailgunService,
  ) {}

  public async newEmailVerificationToken(
    generateNewEmailTokenDto: GenerateNewEmailTokenDto,
  ): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { email: generateNewEmailTokenDto.email },
      relations: { user_auth: true },
    });

    if (!user)
      throw new CustomException(HttpStatus.NOT_FOUND, 'User does not exist');

    const userAuth = await this.userAuthRepository.findOne({
      where: { id: user.user_auth.id },
    });

    if (!userAuth)
      throw new CustomException(HttpStatus.NOT_FOUND, 'Please, try again');

    if (user.isVerified || userAuth.isEmailVerified)
      throw new CustomException(
        HttpStatus.BAD_REQUEST,
        'Email is already verified',
      );

    if (
      userAuth.emailVerificationTokenExpiresIn &&
      userAuth.emailVerificationTokenExpiresIn > new Date()
    )
      throw new CustomException(
        HttpStatus.FORBIDDEN,
        'You have an active verification token',
      );

    const verificationToken =
      this.generateTokenHelper.generateVerificationToken();
    const verificationTokenExpiry = new Date();
    verificationTokenExpiry.setHours(verificationTokenExpiry.getHours() + 1);

    userAuth.emailVerificationToken = verificationToken;
    userAuth.emailVerificationTokenExpiresIn = verificationTokenExpiry;
    userAuth.email_status = VerificationStatus.PENDING;
    await this.userAuthRepository.save(userAuth);
    await this.userAuthRepository.save(user);

    await this.mailgunService.sendVerificationTokenEmail(user, userAuth);
  }
}
