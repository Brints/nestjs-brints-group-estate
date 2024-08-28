import { AbstractBaseEntity } from 'src/base.entity';
import { UserGender, UserRole } from 'src/enums/roles.model';
import { Column, Entity } from 'typeorm';

@Entity({ name: 'users' })
export class User extends AbstractBaseEntity {
  @Column({ type: 'varchar', nullable: true })
  image_url: string;

  @Column({ type: 'varchar', length: 255 })
  first_name: string;

  @Column({ type: 'varchar', length: 255 })
  last_name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 16 })
  password: string;

  @Column({ type: 'varchar', length: 15 })
  phone_number: string;

  @Column({ type: 'enum', enum: UserGender })
  gender: UserGender;

  @Column({ type: 'boolean', default: false })
  isVerified: boolean;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Column({ default: false })
  isTwoFAEnabled: boolean;

  @Column('simple-array', { nullable: true })
  backup_codes: string[];
}
