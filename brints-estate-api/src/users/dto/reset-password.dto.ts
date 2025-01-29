import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    example: 'Test123$',
    type: String,
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  new_password: string;

  @ApiProperty({
    example: 'Test123$',
    type: String,
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  confirm_password: string;
}
