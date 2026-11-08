import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tags')
export class Tag {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ type: 'datetime', nullable: true })
  created: Date | null;

  @Column({ type: 'datetime', nullable: true })
  modified: Date | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  value: string | null;

  @Column({ type: 'text', nullable: true })
  c: string | null;
}
