import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IActiveUser } from 'src/auth/interfaces/active-user.interface';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  public async getAllUsers(user: IActiveUser) {
    return user;
  }

  public async getAll() {
    const users = await this.userRepository.find();
    return users;
  }
}
