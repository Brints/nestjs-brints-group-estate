import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpStatus,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UsersService } from './providers/users.service';
import { ActiveUser } from 'src/auth/decorators/active-user.decorator';
import { IActiveUser } from 'src/auth/interfaces/active-user.interface';

@Controller('users')
@ApiTags('Users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('all')
  async getUser(@ActiveUser() user: IActiveUser) {
    const data = await this.usersService.getAllUsers(user);
    return {
      message: 'Retrieving successful',
      status_code: HttpStatus.OK,
      data,
    };
  }

  @Get()
  @UseInterceptors(ClassSerializerInterceptor)
  async getUsers() {
    const payload = await this.usersService.getAll();
    return {
      message: 'All Users',
      status_code: HttpStatus.OK,
      payload,
    };
  }
}
