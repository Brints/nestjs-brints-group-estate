import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  HttpStatus,
  Post,
  UseFilters,
  UseInterceptors,
} from '@nestjs/common';
import { GoogleAuthenticationService } from './providers/google-authentication.service';
import { AuthType } from '../enum/auth-type.enum';
import { Auth } from '../decorators/auth.decorator';
import { HttpExceptionFilter } from 'src/exceptions/http-exception.filter';
import { GoogleTokenDto } from './dto/google-token.dto';
import { ApiTags } from '@nestjs/swagger';

@Controller('auth')
@ApiTags('Authentication')
export class GoogleAuthenticationController {
  constructor(
    private readonly googleAuthenticationService: GoogleAuthenticationService,
  ) {}

  @Post('google-auth')
  @Auth(AuthType.None)
  @UseInterceptors(ClassSerializerInterceptor)
  @UseFilters(HttpExceptionFilter)
  public async authenticate(@Body() googleTokenDto: GoogleTokenDto) {
    const payload =
      await this.googleAuthenticationService.authenticate(googleTokenDto);

    return {
      message: 'Google Login Successful',
      status_code: HttpStatus.OK,
      payload,
    };
  }
}
