import { Controller, Post, Body, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AuthService } from './providers/auth.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { CreateUserAuthDto } from 'src/users/dto/create-userauth.dto';
import { LoginUserDto } from './dto/login.dto';
import { Auth } from './decorators/auth.decorator';
import { AuthType } from './enum/auth-type.enum';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Controller('auth')
@ApiTags('Authentication')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Auth(AuthType.None)
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

  @Post('login')
  @Auth(AuthType.None)
  @HttpCode(HttpStatus.OK)
  async loginUser(@Body() loginUserDto: LoginUserDto) {
    const user = await this.authService.loginUser(loginUserDto);
    return {
      message: 'Login successful',
      status_code: HttpStatus.OK,
      data: user,
    };
  }

  @Post('refresh-tokens')
  @Auth(AuthType.None)
  @HttpCode(HttpStatus.OK)
  async refreshTokens(@Body() refreshTokenDto: RefreshTokenDto) {
    const tokens = await this.authService.refreshTokens(refreshTokenDto);
    return {
      message: 'Token refresh successful',
      status_code: HttpStatus.OK,
      data: tokens,
    };
  }
}
