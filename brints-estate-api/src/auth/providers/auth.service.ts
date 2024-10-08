import { Injectable } from '@nestjs/common';

import { CreateUserDto } from '../dto/create-user.dto';
import { CreateUserAuthDto } from '../dto/create-userauth.dto';
import { CreateUserProvider } from './create-user.provider';
import { LoginUserDto } from '../dto/login.dto';
import { LoginUserProvider } from './login-user.provider';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { RefreshTokensProvider } from './refresh-tokens.provider';
import { CreateLoginAttemptDto } from '../../login-attempts/dto/create-login-attempt.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly createUserProvider: CreateUserProvider,
    private readonly loginUserProvider: LoginUserProvider,
    private readonly refreshTokensProvider: RefreshTokensProvider,
  ) {}

  public async createUser(
    createUserDto: CreateUserDto,
    createUserAuthDto: CreateUserAuthDto,
    createLoginAttemptDto: CreateLoginAttemptDto,
    file: Express.Multer.File,
  ) {
    return this.createUserProvider.createUser(
      createUserDto,
      createUserAuthDto,
      createLoginAttemptDto,
      file,
    );
  }

  public async loginUser(loginUserDto: LoginUserDto) {
    return this.loginUserProvider.loginUser(loginUserDto);
  }

  public async refreshTokens(refreshTokenDto: RefreshTokenDto) {
    return this.refreshTokensProvider.refreshTokens(refreshTokenDto);
  }
}
