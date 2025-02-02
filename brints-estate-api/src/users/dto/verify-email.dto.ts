import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class VerifyEmailDto {
  @ApiProperty({
    example:
      'f4a64343757b6f6f75ef240ab68ed92f48158b9ade29a2e52b7824cb4fb16d4b85a8d2a9b1ba7829',
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
