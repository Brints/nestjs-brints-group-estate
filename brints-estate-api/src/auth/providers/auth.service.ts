import { Injectable } from '@nestjs/common';

import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { CreateUserAuthDto } from 'src/users/dto/create-userauth.dto';
import { CreateUserProvider } from './create-user.provider';
import { LoginUserDto } from '../dto/login.dto';
import { LoginUserProvider } from './login-user.provider';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { RefreshTokensProvider } from './refresh-tokens.provider';

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
  ) {
    return this.createUserProvider.createUser(createUserDto, createUserAuthDto);
  }

  public async loginUser(loginUserDto: LoginUserDto) {
    return this.loginUserProvider.loginUser(loginUserDto);
  }

  public async refreshTokens(refreshTokenDto: RefreshTokenDto) {
    return this.refreshTokensProvider.refreshTokens(refreshTokenDto);
  }
}
