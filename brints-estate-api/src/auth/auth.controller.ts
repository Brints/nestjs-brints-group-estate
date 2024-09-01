import { Controller, Post, Body, HttpStatus } from '@nestjs/common';
import { AuthService } from './providers/auth.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { CreateUserAuthDto } from 'src/users/dto/create-userauth.dto';
import { ApiTags } from '@nestjs/swagger';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async registerUser(
    @Body()
    createUserDto: CreateUserDto,
    createUserAuthDto: CreateUserAuthDto,
  ) {
    const user = await this.authService.createUser(
      createUserDto,
      createUserAuthDto,
    );
    return {
      message: 'Registration successful',
      status_code: HttpStatus.CREATED,
      data: user,
    };
  }
}
