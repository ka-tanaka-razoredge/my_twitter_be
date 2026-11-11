import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('tweet_relations')
export class TweetRelation {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @Column({ type: 'int' })
  subject: number;

  @Column({ type: 'varchar', length: 50 })
  verb: string;

  @Column({ type: 'int' })
  object: number;

  @Column({ type: 'int', nullable: true })
  index: number | null;

  @CreateDateColumn({ type: 'datetime', nullable: true })
  created: Date | null;

  @UpdateDateColumn({ type: 'datetime', nullable: true })
  modified: Date | null;
}
