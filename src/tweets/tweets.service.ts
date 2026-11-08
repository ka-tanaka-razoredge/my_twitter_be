import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tweet } from './tweet.entity';
import { TweetRelation } from '../tweet-relations/tweet-relation.entity';

@Injectable()
export class TweetsService {
  constructor(
    @InjectRepository(Tweet)
    private tweetsRepository: Repository<Tweet>,
  ) {}

  async findAll(params: {
    skip: number;
    take: number;
    tagId?: number;
  }): Promise<Tweet[]> {
    const { skip, take, tagId } = params;
    if (tagId) {
      const rawTweets: unknown = await this.tweetsRepository.query(
        `
        SELECT tweet.*
        FROM tweets AS tweet
        INNER JOIN tags_records AS te
          ON te.record_id = tweet.tweet_id
          AND te.table_name = 'tweets'
          AND te.tag_id = ?
        ORDER BY tweet.\`index\` ASC, tweet.tweet_id DESC
        LIMIT ? OFFSET ?
        `,
        [tagId, take, skip],
      );

      return rawTweets as Tweet[];
    } else {
      const tweets = await this.tweetsRepository.find({
        skip,
        take,
        order: { index: 'ASC', tweetId: 'DESC' },
      });

      return tweets;
    }
  }

  async countAll(params: { tagId?: number }): Promise<number> {
    const { tagId } = params;

    const qb = this.tweetsRepository.createQueryBuilder('tweet');

    if (tagId !== undefined) {
      qb.innerJoin(
        'tags_records',
        'te',
        'te.record_id = tweet.tweet_id AND te.table_name = :entity AND te.tag_id = :tagId',
        {
          entity: 'tweets',
          tagId,
        },
      );
    }

    return qb.getCount();
  }

  async createTweet(value: string, title?: string): Promise<Tweet> {
    const normalizedValue = value.trim();

    if (!normalizedValue) {
      throw new BadRequestException('Tweet value is required');
    }

    const tweet = this.tweetsRepository.create({
      value: normalizedValue,
      ...(title === undefined ? {} : { title }),
    });

    return this.tweetsRepository.save(tweet);
  }

  async updateTweet(
    tweetId: number,
    value: string,
    title?: string,
  ): Promise<Tweet> {
    const normalizedValue = value.trim();

    if (!normalizedValue) {
      throw new BadRequestException('Tweet value is required');
    }

    const tweet = await this.tweetsRepository.findOneBy({ tweetId });

    if (!tweet) {
      throw new NotFoundException('Tweet not found');
    }

    tweet.value = normalizedValue;
    if (title !== undefined) {
      tweet.title = title;
    }

    return this.tweetsRepository.save(tweet);
  }

  async findById(tweetId: number): Promise<Tweet> {
    const tweet = await this.tweetsRepository.findOneBy({ tweetId });

    if (!tweet) {
      throw new NotFoundException('Tweet not found');
    }

    return tweet;
  }

  async removeTweet(tweetId: number): Promise<void> {
    await this.tweetsRepository.manager.transaction(async (manager) => {
      const incomingRelations = await manager.count(TweetRelation, {
        where: { object: tweetId },
      });
      if (incomingRelations > 0) {
        throw new ConflictException(
          'Cannot delete a tweet that is referenced by another tweet',
        );
      }

      await manager.delete(TweetRelation, { subject: tweetId });
      const deleteResult = await manager.delete(Tweet, { tweetId });
      if (!deleteResult.affected) {
        throw new NotFoundException('Tweet not found');
      }
    });
  }
}
