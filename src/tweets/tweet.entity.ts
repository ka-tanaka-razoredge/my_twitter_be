import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('tweets')
export class Tweet {
  @PrimaryGeneratedColumn({ name: 'tweet_id' })
  tweetId: number;

  @Column({ type: 'int', nullable: true })
  index: number | null;

  @Column({ type: 'text', nullable: true, collation: 'utf8mb4_unicode_ci' })
  value: string | null;

  @Column({ type: 'text', nullable: true, collation: 'utf8mb4_unicode_ci' })
  title: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'modified_at' })
  modifiedAt: Date;
}
