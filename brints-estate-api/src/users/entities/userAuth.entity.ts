import { AbstractBaseEntity } from 'src/base.entity';
import { VerificationStatus } from 'src/enums/roles.model';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'user_auth' })
export class UserAuth extends AbstractBaseEntity {
  @Column({ type: 'boolean', default: false })
  isEmailVerified: boolean;

  @Column({ type: 'numeric' })
  otp: number;

  @Column()
  otpExpiresIn: Date;

  @Column({ type: 'varchar', length: 255 })
  emailVerificationToken: string;

  @Column()
  emailVerificationTokenExpiresIn: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  passwordResetToken?: string;

  @Column({ nullable: true })
  passwordResetTokenExpiresIn?: Date;

  @Column({ type: 'boolean', default: false })
  isPhoneNumberVerified: boolean;

  @Column({
    type: 'enum',
    enum: VerificationStatus,
    default: VerificationStatus.PENDING,
  })
  status: VerificationStatus;

  @OneToOne(() => User, (user) => user.user_auth)
  @JoinColumn()
  user: User;
}
