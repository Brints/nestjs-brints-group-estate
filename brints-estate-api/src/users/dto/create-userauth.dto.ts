import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { VerificationStatus } from 'src/enums/roles.model';

export class CreateUserAuthDto {
  @IsNotEmpty()
  @IsBoolean()
  isEmailVerified: boolean;

  @IsNotEmpty()
  @IsNumber()
  otp: number;

  @IsDate()
  otpExpiresIn: Date;

  @IsNotEmpty()
  @IsString()
  emailVerificationToken: string;

  @IsNotEmpty()
  @IsDate()
  emailVerificationTokenExpiresIn: Date;

  @IsOptional()
  @IsString()
  passwordResetToken?: string;

  @IsNotEmpty()
  @IsDate()
  passwordResetTokenExpiresIn?: Date;

  @IsNotEmpty()
  @IsBoolean()
  isPhoneNumberVerified: boolean;

  @IsNotEmpty()
  @IsString()
  status: VerificationStatus;
}
