import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TweetsService } from './tweets.service';
import { TweetsController } from './tweets.controller';
import { Tweet } from './tweet.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tweet])],
  providers: [TweetsService],
  controllers: [TweetsController],
})
export class TweetsModule {}
