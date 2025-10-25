import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { UserGender } from '../../enums/gender.enum';

export class CreateUserDto {
  @ApiProperty({
    description: 'Upload an image avatar.',
    type: String,
    format: 'binary',
    required: false,
  })
  @IsOptional()
  image_url: string;

  @ApiProperty({
    description: 'First name of the user',
    example: 'John',
    type: String,
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  first_name: string;

  @ApiProperty({
    description: 'Last name of the user',
    example: 'Doe',
    type: String,
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  last_name: string;

  @ApiProperty({
    description: 'Enter your full email address',
    example: 'example@test.com',
    type: String,
    required: true,
  })
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(255)
  @Transform(({ value }) => value.toLowerCase())
  email: string;

  @ApiProperty({
    description:
      'Password that includes uppercase, lowercase, number and symbol.',
    example: 'Test123$',
    type: String,
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @Matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])/, {
    message: 'password too weak',
  })
  password: string;

  @ApiProperty({
    description: 'Repeat password.',
    example: 'Test123$',
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

  @ApiProperty({
    description: 'Enter your country code.',
    example: '234',
    type: String,
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^[0-9]{1,5}$/, {
    message: 'Please enter a correct country code',
  })
  country_code: string;

  @ApiProperty({
    description: 'Enter your phone number.',
    example: '080123456789',
    type: String,
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  phone_number: string;

  @ApiProperty({
    enum: UserGender,
    description: 'The gender of the user.',
    examples: ['female', 'male'],
    type: String,
    required: true,
  })
  @IsNotEmpty()
  @IsEnum(UserGender)
  @Transform(({ value }) => value.toLowerCase())
  gender: UserGender;

  @ApiProperty({
    description: 'Accept terms and conditions to proceed.',
    example: 'true',
    type: Boolean,
    required: true,
  })
  @IsNotEmpty()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  terms_and_conditions: boolean;

  @ApiProperty({
    description: 'Accept our privacy policy to proceed.',
    example: 'true',
    type: Boolean,
    required: true,
  })
  @IsNotEmpty()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  privacy_policy: boolean;

  @ApiProperty({
    description: 'Accept our marketing.',
    example: 'true',
    type: Boolean,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  marketing_consent: boolean;
}
