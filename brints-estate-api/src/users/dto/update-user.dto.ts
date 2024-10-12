import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from '../../auth/dto/create-user.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({
    description: 'The id of the user',
    example: '60b7f3a8d8e9a7e4d8f9b1a7',
  })
  @IsNotEmpty()
  @IsString()
  id: string;

  @ApiProperty({
    description: "The user's country code",
    example: '+234',
  })
  @IsOptional()
  @IsString()
  country_code?: string;
}
