import {
  Controller,
  Post,
  Body,
  HttpStatus,
  HttpCode,
  UseInterceptors,
  ClassSerializerInterceptor,
  UploadedFile,
} from '@nestjs/common';
import { ApiHeaders, ApiOperation, ApiTags } from '@nestjs/swagger';

import { AuthService } from './providers/auth.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { CreateUserAuthDto } from 'src/users/dto/create-userauth.dto';
import { LoginUserDto } from './dto/login.dto';
import { Auth } from './decorators/auth.decorator';
import { AuthType } from './enum/auth-type.enum';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('auth')
@ApiTags('Authentication')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseInterceptors(FileInterceptor('file'))
  @ApiHeaders([{ name: 'Content-Type', description: 'multipart/form-data' }])
  @ApiOperation({
    summary: 'Registers a new user',
  })
  @Post('register')
  @Auth(AuthType.None)
  @UseInterceptors(ClassSerializerInterceptor)
  async registerUser(
    @Body()
    createUserDto: CreateUserDto,
    createUserAuthDto: CreateUserAuthDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const payload = await this.authService.createUser(
      createUserDto,
      createUserAuthDto,
      file,
    );
    return {
      message: 'Registration successful',
      status_code: HttpStatus.CREATED,
      payload,
    };
  }

  @ApiOperation({
    summary: 'Logs in a registered user and generates an access token',
  })
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

  @ApiOperation({
    summary: 'Generates new access token and refresh token',
  })
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
