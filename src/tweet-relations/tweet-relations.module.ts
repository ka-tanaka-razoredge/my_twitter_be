import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TweetRelation } from './tweet-relation.entity';
import { TweetRelationsController } from './tweet-relations.controller';
import { TweetRelationsService } from './tweet-relations.service';

@Module({
  imports: [TypeOrmModule.forFeature([TweetRelation])],
  providers: [TweetRelationsService],
  controllers: [TweetRelationsController],
})
export class TweetRelationsModule {}
