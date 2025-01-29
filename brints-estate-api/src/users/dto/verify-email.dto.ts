import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class VerifyEmailDto {
  @ApiProperty({
    example: 'gsteu266dinjd8h4gd6784nuuv',
    type: String,
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  email_verification_token: string;

  @ApiProperty({
    example: 'example@test.com',
    type: String,
    required: true,
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
