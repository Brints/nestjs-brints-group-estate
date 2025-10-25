import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyPhoneNumberDto {
  @ApiProperty({
    example: '234',
    type: String,
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  country_code: string;

  @ApiProperty({
    example: '08021234567',
    type: String,
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  phone_number: string;

  @ApiProperty({
    example: '123456',
    type: String,
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  otp: string;
}
