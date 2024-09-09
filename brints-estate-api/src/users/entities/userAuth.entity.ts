import { AbstractBaseEntity } from 'src/base.entity';
import { VerificationStatus } from 'src/enums/roles.model';
import { Column, Entity } from 'typeorm';

@Entity({ name: 'user_auth' })
export class UserAuth extends AbstractBaseEntity {
  @Column({ type: 'boolean', default: false })
  isEmailVerified: boolean;

  @Column({ type: 'varchar', nullable: true })
  otp: string | null;

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
