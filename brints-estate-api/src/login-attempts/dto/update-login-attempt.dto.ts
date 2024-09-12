import { PartialType } from '@nestjs/swagger';
import { CreateLoginAttemptDto } from './create-login-attempt.dto';

export class UpdateLoginAttemptDto extends PartialType(CreateLoginAttemptDto) {}
