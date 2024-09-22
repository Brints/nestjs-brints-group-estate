import {
  Controller,
  Post,
  Body,
  HttpStatus,
  HttpCode,
  UseInterceptors,
  ClassSerializerInterceptor,
  UploadedFile,
  UseFilters,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiHeaders,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { AuthService } from './providers/auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { CreateUserAuthDto } from '../users/dto/create-userauth.dto';
import { LoginUserDto } from './dto/login.dto';
import { Auth } from './decorators/auth.decorator';
import { AuthType } from './enum/auth-type.enum';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { CreateLoginAttemptDto } from '../login-attempts/dto/create-login-attempt.dto';
import { HttpExceptionFilter } from '../exceptions/http-exception.filter';
import { User } from '../users/entities/user.entity';

@Controller('auth')
@ApiTags('Authentication')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiHeaders([{ name: 'Content-Type', description: 'multipart/form-data' }])
  @ApiOperation({
    summary: 'Registers a new user',
  })
  @ApiCreatedResponse({
    description: 'User registration successful',
    status: HttpStatus.CREATED,
    type: User,
  })
  @ApiBadRequestResponse({
    description: 'Bad request',
    status: HttpStatus.BAD_REQUEST,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
  })
  @Post('register')
  @Auth(AuthType.None)
  @UseInterceptors(FileInterceptor('file'))
  @UseInterceptors(ClassSerializerInterceptor)
  @UseFilters(HttpExceptionFilter)
  async registerUser(
    @Body()
    createUserDto: CreateUserDto,
    createUserAuthDto: CreateUserAuthDto,
    createLoginAttemptDto: CreateLoginAttemptDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const payload = await this.authService.createUser(
      createUserDto,
      createUserAuthDto,
      createLoginAttemptDto,
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
  @UseInterceptors(ClassSerializerInterceptor)
  @HttpCode(HttpStatus.OK)
  @UseFilters(HttpExceptionFilter)
  async loginUser(@Body() loginUserDto: LoginUserDto) {
    const payload = await this.authService.loginUser(loginUserDto);
    return {
      message: 'Login successful',
      status_code: HttpStatus.OK,
      payload,
    };
  }

  @ApiOperation({
    summary: 'Generates new access token and refresh token',
  })
  @Post('refresh-tokens')
  @Auth(AuthType.None)
  @HttpCode(HttpStatus.OK)
  @UseFilters(HttpExceptionFilter)
  async refreshTokens(@Body() refreshTokenDto: RefreshTokenDto) {
    const payload = await this.authService.refreshTokens(refreshTokenDto);
    return {
      message: 'Token refresh successful',
      status_code: HttpStatus.OK,
      payload,
    };
  }
}
