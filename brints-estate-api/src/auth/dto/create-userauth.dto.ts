import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { VerificationStatus } from '../../enums/status.enum';

export class CreateUserAuthDto {
  @IsNotEmpty()
  @IsBoolean()
  isEmailVerified: boolean;

  @IsNotEmpty()
  @IsString()
  otp: string;

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
