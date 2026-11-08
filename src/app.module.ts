import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from './auth/auth.module';
import { TweetsModule } from './tweets/tweets.module';
import { User } from './users/user.entity';
import { Tweet } from './tweets/tweet.entity';
import { TagEntity } from './tags/tag-entity.entity';
import { TagsRecordsModule } from './tags/tags-records.module';
import { Tag } from './tags/tag.entity';
import { TagsModule } from './tags/tags.module';
import { TweetRelation } from './tweet-relations/tweet-relation.entity';
import { TweetRelationsModule } from './tweet-relations/tweet-relations.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'razoredge',
      password: 'Ad20100622',
      database: 'razoredge',
      entities: [User, Tweet, TagEntity, Tag, TweetRelation],
      synchronize: false,
    }),
    AuthModule,
    TweetsModule,
    TagsRecordsModule,
    TagsModule,
    TweetRelationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
