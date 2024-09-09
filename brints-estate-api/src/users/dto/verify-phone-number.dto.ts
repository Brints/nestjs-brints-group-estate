import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class VerifyPhoneNumberDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  otp: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  phone_number: string;
}
