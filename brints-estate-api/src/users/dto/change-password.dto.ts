import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'The old password of the user',
    example: 'password',
    type: String,
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  old_password: string;

  @ApiProperty({
    description: 'The new password of the user',
    example: 'password',
    type: String,
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @Matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])/, {
    message: 'password too weak',
  })
  new_password: string;

  @ApiProperty({
    description: 'The confirm password of the user',
    example: 'password',
    type: String,
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @Matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])/, {
    message: 'password too weak',
  })
  confirm_password: string;
}
