import { AbstractBaseEntity } from 'src/base.entity';
import { Column, Entity } from 'typeorm';
import { FileTypes } from './enums/file-types.enum';

@Entity()
export class Upload extends AbstractBaseEntity {
  @Column({ type: 'varchar', length: 255, nullable: false })
  file_name: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  file_path: string;

  @Column({
    type: 'enum',
    enum: FileTypes,
    nullable: false,
    default: FileTypes.IMAGE,
  })
  file_type: string;

  @Column({ type: 'varchar', length: 128, nullable: false })
  file_mime: string;

  @Column({ type: 'numeric', nullable: false })
  file_size: number;
}
