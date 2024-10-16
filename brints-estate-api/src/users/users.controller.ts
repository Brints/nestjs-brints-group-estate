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
  Param,
  Put,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UsersService } from './providers/users.service';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { VerifyPhoneNumberDto } from './dto/verify-phone-number.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { AuthType } from '../auth/enum/auth-type.enum';
import { HttpExceptionFilter } from '../exceptions/http-exception.filter';
import { GenerateNewOTPDto } from './dto/generate-new-otp.dto';
import { GenerateNewEmailTokenDto } from './dto/new-email-token.dto';
import { ActiveUser } from '../auth/decorators/active-user.decorator';
import { IActiveUser } from '../auth/interfaces/active-user.interface';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { IResetPassword } from './interface/reset-password.interface';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('user')
@ApiTags('Users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({
    summary: 'Verifies user email address.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User email verified successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid token',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Token expired',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User already verified',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error. Please try again later',
  })
  @Get('verify-email')
  @Auth(AuthType.None)
  @UseInterceptors(ClassSerializerInterceptor)
  @UseFilters(HttpExceptionFilter)
  public async verifyUserEmail(@Query() verifyEmailDto: VerifyEmailDto) {
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
  public async verifyUserPhone(
    @Body() verifyPhoneNumberDto: VerifyPhoneNumberDto,
  ) {
    const payload =
      await this.usersService.verifyPhoneNumber(verifyPhoneNumberDto);

    return {
      message: 'Your phone number has been verified successfully.',
      status_code: HttpStatus.OK,
      payload,
    };
  }

  @Post('forgot-password')
  @Auth(AuthType.None)
  @HttpCode(HttpStatus.OK)
  @UseFilters(HttpExceptionFilter)
  public async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    const payload = await this.usersService.forgotPassword(forgotPasswordDto);

    return {
      message: 'Password reset link sent to your email address.',
      status_code: HttpStatus.OK,
      payload,
    };
  }

  @Post('resend-otp')
  @Auth(AuthType.None)
  @HttpCode(HttpStatus.OK)
  @UseFilters(HttpExceptionFilter)
  public async resendOTP(@Body() generateNewOTPDto: GenerateNewOTPDto) {
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
  public async generateNewEmailToken(
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

  @ApiBearerAuth('access-token')
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @UseFilters(HttpExceptionFilter)
  public async changePassword(
    @ActiveUser() activeUser: IActiveUser,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    const payload = await this.usersService.changePassword(
      activeUser,
      changePasswordDto,
    );

    return {
      message: 'Password successfully changed',
      status_code: HttpStatus.OK,
      payload,
    };
  }

  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Get user profile.',
  })
  @Get('/:id')
  @Auth(AuthType.Bearer)
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(ClassSerializerInterceptor)
  @UseFilters(HttpExceptionFilter)
  public async getUser(
    @Param('id') userId: string,
    @ActiveUser() loggedInUser: IActiveUser,
  ) {
    const payload = await this.usersService.getUserProfile(
      loggedInUser,
      userId,
    );

    return {
      message: 'Profile fetched successfully',
      status_code: HttpStatus.OK,
      payload,
    };
  }

  @Post('/reset-password/:email/:token')
  @Auth(AuthType.None)
  @UseInterceptors(ClassSerializerInterceptor)
  @UseFilters(HttpExceptionFilter)
  public async resetPassword(
    @Param() params: IResetPassword,
    @Body() resetPasswordDto: ResetPasswordDto,
  ) {
    const payload = await this.usersService.resetPassword(
      params,
      resetPasswordDto,
    );

    return {
      message: 'Password Reset Successful',
      status_code: HttpStatus.OK,
      payload,
    };
  }

  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Updates user details.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User profile updated successfully',
  })
  @Put('/:userId')
  @Auth(AuthType.Bearer)
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(ClassSerializerInterceptor)
  @UseFilters(HttpExceptionFilter)
  public async updateUser(
    @Param('userId') userId: string,
    @Body() updateUserDto: UpdateUserDto,
    @ActiveUser() activeUser: IActiveUser,
    file: Express.Multer.File,
  ) {
    const payload = await this.usersService.updateUser(
      updateUserDto,
      userId,
      activeUser,
      file,
    );

    return {
      message: 'Profile updated successfully',
      status_code: HttpStatus.OK,
      payload,
    };
  }
}
