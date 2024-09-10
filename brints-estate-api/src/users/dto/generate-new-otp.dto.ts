import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class GenerateNewOTPDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
