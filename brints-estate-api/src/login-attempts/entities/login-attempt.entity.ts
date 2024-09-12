import { AbstractBaseEntity } from 'src/base.entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class LoginAttempts extends AbstractBaseEntity {
  @Column({ type: 'int', default: 0 })
  login_attempts: number;

  @Column({ type: 'boolean', default: false })
  isBlocked: boolean;

  @Column({ type: 'timestamptz', nullable: true, default: null })
  blockedUntil: Date | null;
}
