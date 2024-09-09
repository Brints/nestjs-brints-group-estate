import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class VerifyEmailDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  email_verification_token: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
