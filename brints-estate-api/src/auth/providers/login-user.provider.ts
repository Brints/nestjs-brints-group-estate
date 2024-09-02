import { forwardRef, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { User } from 'src/users/entities/user.entity';
import { HashingProvider } from './hashing.provider';
import { LoginUserDto } from '../dto/login.dto';
import { CustomException } from 'src/exceptions/custom.exception';

@Injectable()
export class LoginUserProvider {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @Inject(forwardRef(() => HashingProvider))
    private readonly hashingProvider: HashingProvider,
  ) {}

  public async loginUser(loginUserDto: LoginUserDto): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { email: loginUserDto.email },
    });

    if (!user) {
      throw new CustomException(HttpStatus.NOT_FOUND, 'User not found');
    }

    const passwordMatch = await this.hashingProvider.comparePassword(
      loginUserDto.password,
      user.password,
    );

    if (!passwordMatch) {
      throw new CustomException(
        HttpStatus.BAD_REQUEST,
        'Invalid login credentials',
      );
    }

    return user;
  }
}
