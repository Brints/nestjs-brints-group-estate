import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpStatus,
  UseInterceptors,
  Query,
  UseFilters,
  Post,
  Body,
  HttpCode,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UsersService } from './providers/users.service';
// import { ActiveUser } from 'src/auth/decorators/active-user.decorator';
// import { IActiveUser } from 'src/auth/interfaces/active-user.interface';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { VerifyPhoneNumberDto } from './dto/verify-phone-number.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { AuthType } from 'src/auth/enum/auth-type.enum';
import { HttpExceptionFilter } from 'src/exceptions/http-exception.filter';
import { GenerateNewOTPDto } from './dto/generate-new-otp.dto';
import { GenerateNewEmailTokenDto } from './dto/new-email-token.dto';

@Controller('users')
@ApiTags('Users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // @Get('all')
  // async getUser(@ActiveUser() user: IActiveUser) {
  //   const data = await this.usersService.getAllUsers(user);
  //   return {
  //     message: 'Retrieving successful',
  //     status_code: HttpStatus.OK,
  //     data,
  //   };
  // }

  // @Get()
  // @UseInterceptors(ClassSerializerInterceptor)
  // async getUsers() {
  //   const payload = await this.usersService.getAll();
  //   return {
  //     message: 'All Users',
  //     status_code: HttpStatus.OK,
  //     payload,
  //   };
  // }

  @Get('verify-email')
  @Auth(AuthType.None)
  @UseInterceptors(ClassSerializerInterceptor)
  @UseFilters(HttpExceptionFilter)
  async verifyUserEmail(@Query() verifyEmailDto: VerifyEmailDto) {
    const payload = await this.usersService.verifyUserEmail(verifyEmailDto);

    return {
      message: 'Your email has been verified successfully.',
      status_code: HttpStatus.OK,
      payload,
    };
  }

  @Post('verify-phone')
  @Auth(AuthType.None)
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(ClassSerializerInterceptor)
  @UseFilters(HttpExceptionFilter)
  async verifyUserPhone(@Body() verifyPhoneNumberDto: VerifyPhoneNumberDto) {
    const payload =
      await this.usersService.verifyPhoneNumber(verifyPhoneNumberDto);

    return {
      message: 'Your phone number has been verified successfully.',
      status_code: HttpStatus.OK,
      payload,
    };
  }

  @Post('resend-otp')
  @Auth(AuthType.None)
  @HttpCode(HttpStatus.OK)
  @UseFilters(HttpExceptionFilter)
  async resendOTP(@Body() generateNewOTPDto: GenerateNewOTPDto) {
    const payload = await this.usersService.resendOTP(generateNewOTPDto);

    return {
      message: 'New OTP sent to your registered phone number.',
      status_code: HttpStatus.OK,
      payload,
    };
  }

  @Post('resend-token')
  @Auth(AuthType.None)
  @HttpCode(HttpStatus.OK)
  @UseFilters(HttpExceptionFilter)
  async generateNewEmailToken(
    @Body() generateNewEmailTokenDto: GenerateNewEmailTokenDto,
  ) {
    const payload = await this.usersService.newEmailVerificationToken(
      generateNewEmailTokenDto,
    );

    return {
      message: 'New Email verification token sent to your email address.',
      status_code: HttpStatus.OK,
      payload,
    };
  }
}
