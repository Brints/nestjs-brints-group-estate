import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';

@Injectable()
export class UsersService {
  create(createUserDto: CreateUserDto) {
    return { message: 'This action adds a new user', createUserDto };
  }
}
