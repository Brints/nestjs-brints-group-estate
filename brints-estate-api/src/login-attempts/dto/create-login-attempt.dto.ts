import { IsBoolean, IsDate, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateLoginAttemptDto {
  @IsNotEmpty()
  @IsNumber()
  login_attempts: number;

  @IsNotEmpty()
  @IsBoolean()
  isBlocked: boolean;

  @IsDate()
  blockedUntil: Date;
}
