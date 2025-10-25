import { Injectable } from '@nestjs/common';

import { CreateUserDto } from '../dto/create-user.dto';
import { CreateUserAuthDto } from '../dto/create-userauth.dto';
import { CreateUserProvider } from './create-user.provider';
import { LoginUserDto } from '../dto/login.dto';
import { LoginUserProvider } from './login-user.provider';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { RefreshTokensProvider } from './refresh-tokens.provider';
import { CreateLoginAttemptDto } from '../../login-attempts/dto/create-login-attempt.dto';
import { User } from 'src/users/entities/user.entity';
import {
  ILoginUser,
  IRefreshToken,
} from '../interfaces/auth-service.interface';

/**
 * AuthService Class handles the business logic of the authentication module.
 * @class AuthService
 * @exports AuthService
 * @constructor createUserProvider
 * @constructor loginUserProvider
 * @constructor refreshTokensProvider
 */
@Injectable()
export class AuthService {
  /**
   * Constructor AuthService
   */
  constructor(
    private readonly createUserProvider: CreateUserProvider,
    private readonly loginUserProvider: LoginUserProvider,
    private readonly refreshTokensProvider: RefreshTokensProvider,
  ) {}

  /**
   * createUser method handles the create user logic.
   * @param createUserDto
   * @param createUserAuthDto
   * @param createLoginAttemptDto
   * @param file
   * @returns {Promise<User>}
   */
  public async createUser(
    createUserDto: CreateUserDto,
    createUserAuthDto: CreateUserAuthDto,
    createLoginAttemptDto: CreateLoginAttemptDto,
    file: Express.Multer.File,
  ): Promise<User> {
    return this.createUserProvider.createUser(
      createUserDto,
      createUserAuthDto,
      createLoginAttemptDto,
      file,
    );
  }

  /**
   * loginUser method handles the login logic.
   * @param loginUserDto
   * @returns {Promise<ILoginUser | undefined>}
   */
  public async loginUser(
    loginUserDto: LoginUserDto,
  ): Promise<ILoginUser | undefined> {
    return this.loginUserProvider.loginUser(loginUserDto);
  }

  /**
   * refreshTokens method handles the refresh token logic.
   * @param refreshTokenDto
   * @returns {Promise<IRefreshToken>}
   */
  public async refreshTokens(
    refreshTokenDto: RefreshTokenDto,
  ): Promise<IRefreshToken> {
    return this.refreshTokensProvider.refreshTokens(refreshTokenDto);
  }
}
