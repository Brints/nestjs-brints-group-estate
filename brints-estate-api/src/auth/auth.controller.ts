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
  ApiBody,
  ApiConflictResponse,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { AuthService } from './providers/auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateUserAuthDto } from './dto/create-userauth.dto';
import { LoginUserDto } from './dto/login.dto';
import { Auth } from './decorators/auth.decorator';
import { AuthType } from './enum/auth-type.enum';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { CreateLoginAttemptDto } from '../login-attempts/dto/create-login-attempt.dto';
import { HttpExceptionFilter } from '../exceptions/http-exception.filter';
// import { User } from '../users/entities/user.entity';
import {
  BadRequestResponse,
  ConflictResponse,
  CreatedUserResponse,
  InternalServerErrorResponse,
} from './swagger_docs/register-user.doc';

@Controller('auth')
@ApiTags('Authentication')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({
    summary: 'Registers a new user',
  })
  @ApiConsumes('application/json', 'multipart/form-data')
  @ApiBody({
    description: 'User registration',
    type: CreateUserDto,
  })
  @ApiCreatedResponse(CreatedUserResponse)
  @ApiConflictResponse(ConflictResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiResponse(InternalServerErrorResponse)
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
