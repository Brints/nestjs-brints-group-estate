import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class GenerateNewOTPDto {
  @ApiProperty()
  @IsNotEmpty()
  country_code: string;

  @ApiProperty()
  @IsNotEmpty()
  phone_number: string;
}
