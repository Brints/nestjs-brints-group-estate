import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}

/*
import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Headers,
  Ip,
} from '@nestjs/common';
// import { UsersService } from './users.service';

interface UserPayload {
  firstName: string;
  lastName: string;
  email: string;
  age: number;
}

@Controller('users')
export class UsersController {
  // constructor(private readonly usersService: UsersService) {}
  @Get('/:id')
  public getUser(@Param() params: number) {
    console.log(params);
    return 'Fetch Single User';
  }

  @Post()
  public registerUser(
    @Body() payload: UserPayload,
    @Headers() headers: any,
    @Ip() ip: any,
  ) {
    return { message: 'Registration successful', ip, payload, headers };
  }
}
*/
