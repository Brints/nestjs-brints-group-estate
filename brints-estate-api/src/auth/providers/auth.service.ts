import { Injectable } from '@nestjs/common';

import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { CreateUserAuthDto } from 'src/users/dto/create-userauth.dto';
import { CreateUserProvider } from './create-user.provider';
import { LoginUserDto } from '../dto/login.dto';
import { LoginUserProvider } from './login-user.provider';

@Injectable()
export class AuthService {
  constructor(
    private readonly createUserProvider: CreateUserProvider,
    private readonly loginUserProvider: LoginUserProvider,
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
}
