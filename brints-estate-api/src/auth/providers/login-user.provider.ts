import { forwardRef, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { User } from 'src/users/entities/user.entity';
import { HashingProvider } from './hashing.provider';
import { LoginUserDto } from '../dto/login.dto';
import { CustomException } from 'src/exceptions/custom.exception';
import { GenerateTokensProvider } from './generate-tokens.provider';
import { AccountStatus } from 'src/enums/roles.model';

@Injectable()
export class LoginUserProvider {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @Inject(forwardRef(() => HashingProvider))
    private readonly hashingProvider: HashingProvider,

    private readonly generateTokensProvider: GenerateTokensProvider,
  ) {}

  public async loginUser(
    loginUserDto: LoginUserDto,
  ): Promise<{ access_token: string }> {
    const user = await this.userRepository.findOne({
      where: { email: loginUserDto.email },
    });

    if (!user) {
      throw new CustomException(HttpStatus.NOT_FOUND, 'User not found');
    }

    const passwordMatch: boolean = await this.hashingProvider.comparePassword(
      loginUserDto.password,
      user.password,
    );

    if (!passwordMatch) {
      throw new CustomException(
        HttpStatus.BAD_REQUEST,
        'Invalid login credentials',
      );
    }

    if (!user.isVerified) {
      throw new CustomException(
        HttpStatus.BAD_REQUEST,
        'User account not verified',
      );
    }

    if (
      user.account_status === AccountStatus.BLOCKED ||
      user.account_status === AccountStatus.SUSPENDED
    )
      throw new CustomException(
        HttpStatus.FORBIDDEN,
        'Your account has been blocked. Contact admin.',
      );

    if (user.account_status !== AccountStatus.ACTIVE) {
      user.account_status = AccountStatus.ACTIVE;
      await this.userRepository.save(user);
    }

    return await this.generateTokensProvider.generateTokens(user);
  }
}
