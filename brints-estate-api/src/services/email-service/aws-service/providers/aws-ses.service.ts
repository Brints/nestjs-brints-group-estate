import { Injectable } from '@nestjs/common';
import { SendVerificationTokenEmailProvider } from './send-verification-token-email.provider';
import { User } from 'src/users/entities/user.entity';
import { UserAuth } from 'src/users/entities/userAuth.entity';

@Injectable()
export class AwsSesService {
  constructor(
    private readonly sendVerificationTokenEmailProvider: SendVerificationTokenEmailProvider,
  ) {}

  public async sendVerifyEmail(user: User, userAuth: UserAuth) {
    await this.sendVerificationTokenEmailProvider.sendVerificationTokenEmail(
      user,
      userAuth,
    );
  }
}
