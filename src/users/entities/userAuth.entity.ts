import { Column, Entity } from 'typeorm';

import { AbstractBaseEntity } from '../../base.entity';
import { VerificationStatus } from '../../enums/status.enum';

@Entity({ name: 'user_auth' })
export class UserAuth extends AbstractBaseEntity {
  @Column({ type: 'boolean', default: false })
  isEmailVerified: boolean;

  @Column({ type: 'int', nullable: true })
  otp: number | null;

  @Column({
    type: 'enum',
    enum: VerificationStatus,
    default: VerificationStatus.PENDING,
  })
  otp_status: VerificationStatus | null;

  @Column({
    type: 'enum',
    enum: VerificationStatus,
    default: VerificationStatus.PENDING,
  })
  email_status: VerificationStatus | null;

  @Column({ type: 'timestamptz', nullable: true })
  otpExpiresIn: Date | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  emailVerificationToken: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  emailVerificationTokenExpiresIn: Date | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  passwordResetToken?: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  passwordResetTokenExpiresIn?: Date | null;

  @Column({ type: 'boolean', default: false })
  isPhoneNumberVerified: boolean;

  @Column({
    type: 'enum',
    enum: VerificationStatus,
    default: VerificationStatus.PENDING,
  })
  status: VerificationStatus;
}
