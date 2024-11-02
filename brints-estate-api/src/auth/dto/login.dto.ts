import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginUserDto {
  @ApiProperty({
    description: 'Enter your registered email address.',
    example: 'example@test.com',
    type: String,
    required: true,
  })
  @IsNotEmpty()
  @IsEmail()
  @IsString()
  email: string;

  @ApiProperty({
    description: 'Enter your password.',
    example: 'Test123$',
    type: String,
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  password: string;
}
