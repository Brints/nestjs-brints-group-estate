import { AbstractBaseEntity } from 'src/base.entity';
import { AccountStatus, UserGender, UserRole } from 'src/enums/roles.model';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { UserAuth } from './userAuth.entity';
import { Exclude } from 'class-transformer';

@Entity({ name: 'users' })
export class User extends AbstractBaseEntity {
  @Column({ type: 'varchar', nullable: true })
  image_url?: string;

  @Column({ type: 'varchar', length: 255 })
  first_name: string;

  @Column({ type: 'varchar', length: 255 })
  last_name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  @Exclude()
  password: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  phone_number: string;

  @Column({ type: 'enum', enum: UserGender })
  gender: UserGender;

  @Column({ type: 'boolean', default: false })
  isVerified: boolean;

  @Column({ type: 'varchar', length: 10, default: AccountStatus.INACTIVE })
  account_status: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Column({ default: false })
  isTwoFAEnabled: boolean;

  @Column('simple-array', { nullable: true })
  @Exclude()
  backup_codes: string[];

  @Column({ type: 'varchar', nullable: true })
  @Exclude()
  google_id?: string;

  @OneToOne(() => UserAuth, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  @Exclude()
  user_auth: UserAuth;
}
