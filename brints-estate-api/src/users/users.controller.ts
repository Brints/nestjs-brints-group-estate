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
  ApiOkResponse,
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

import {
  BadRequestInvalidTokenResponse,
  ForbiddenTokenExpiredResponse,
  VerifyEmailResponse,
} from './swagger_docs/verify-email.doc';
import {
  InternalServerErrorResponse,
  UnauthorizedUserVerifiedResponse,
} from './swagger_docs/common-reponses.doc';
import {
  ForbiddenAccountVerifiedResponse,
  IncorrectPhoneNumberResponse,
  InvalidOTPResponse,
  NotFoundPhoneNumberResponse,
  OTPExpiredResponse,
  VerifyPhoneResponse,
} from './swagger_docs/verify-phone-response.doc';

@Controller('user')
@ApiTags('User Management')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({
    summary: 'Verify registered user email address.',
  })
  @ApiResponse(VerifyEmailResponse)
  @ApiResponse(BadRequestInvalidTokenResponse)
  @ApiResponse(ForbiddenTokenExpiredResponse)
  @ApiResponse(UnauthorizedUserVerifiedResponse)
  @ApiResponse(InternalServerErrorResponse)
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

  @ApiOperation({
    summary: 'Verify registered user phone number.',
  })
  @ApiOkResponse(VerifyPhoneResponse)
  @ApiResponse(NotFoundPhoneNumberResponse)
  @ApiResponse(IncorrectPhoneNumberResponse)
  @ApiResponse(ForbiddenAccountVerifiedResponse)
  @ApiResponse(OTPExpiredResponse)
  @ApiResponse(InvalidOTPResponse)
  @ApiResponse(InternalServerErrorResponse)
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

  @ApiOperation({
    summary: 'Forgot password endpoint.',
  })
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

  @ApiOperation({
    summary: 'Resend new OTP after expiration.',
  })
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

  @ApiOperation({
    summary: 'Resend token to email address after expiration.',
  })
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
  @ApiOperation({
    summary: 'Change user Password. User must be authenticated.',
  })
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
    summary: 'Get user profile. User must be authenticated',
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

  @ApiOperation({
    summary: 'Reset forgotten password.',
  })
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
    summary: 'Update use details. User must be authenticated.',
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
