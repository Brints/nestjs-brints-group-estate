import { Injectable } from '@nestjs/common';

import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { CreateUserAuthDto } from 'src/users/dto/create-userauth.dto';
import { CreateUserProvider } from './create-user.provider';

@Injectable()
export class AuthService {
  constructor(private readonly createUserProvider: CreateUserProvider) {}

  public async createUser(
    createUserDto: CreateUserDto,
    createUserAuthDto: CreateUserAuthDto,
  ) {
    return this.createUserProvider.createUser(createUserDto, createUserAuthDto);
  }
}
