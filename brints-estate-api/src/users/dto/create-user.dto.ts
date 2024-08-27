import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
  IsUrl,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsOptional()
  @IsString()
  @IsUrl()
  readonly image_url: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  readonly first_name: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  readonly last_name: string;

  @IsNotEmpty()
  @IsEmail()
  @MaxLength(70)
  readonly email: string;

  @IsString()
  @IsNotEmpty()
  @IsStrongPassword()
  @MinLength(8)
  @Matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])/, {
    message: 'password too weak',
  })
  readonly password: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(15)
  readonly phone_number: string;

  @IsString()
  @IsNotEmpty()
  readonly gender: string;

  @IsString()
  @IsNotEmpty()
  readonly role: string;
}
