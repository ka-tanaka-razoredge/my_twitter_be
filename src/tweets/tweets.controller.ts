import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TweetsService } from './tweets.service';
import { Tweet } from './tweet.entity';

@Controller('tweets')
export class TweetsController {
  constructor(private readonly tweetsService: TweetsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getTweets(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('tag_id') tagId?: number,
  ): Promise<Tweet[]> {
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    return this.tweetsService.findAll({ skip, take: limitNum, tagId });
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('count')
  async countTweets(
    @Query('tag_id') tagId?: number,
  ): Promise<{ count: number }> {
    const count = await this.tweetsService.countAll({ tagId });
    return { count };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':tweetId')
  async getTweet(@Param('tweetId') tweetId: string): Promise<Tweet> {
    const id = Number(tweetId);
    if (!Number.isSafeInteger(id) || id <= 0) {
      throw new BadRequestException('tweetId must be a positive integer');
    }

    return this.tweetsService.findById(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async createTweet(
    @Body() body: { value?: string; title?: unknown },
  ): Promise<Tweet> {
    if (typeof body?.value !== 'string') {
      throw new BadRequestException('Tweet value must be a string');
    }

    if (body.title !== undefined && typeof body.title !== 'string') {
      throw new BadRequestException('Tweet title must be a string');
    }

    return this.tweetsService.createTweet(body.value, body.title);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':tweetId')
  async updateTweet(
    @Param('tweetId') tweetId: string,
    @Body() body: { value?: string; title?: unknown },
  ): Promise<Tweet> {
    const id = Number(tweetId);
    if (!Number.isSafeInteger(id) || id <= 0) {
      throw new BadRequestException('tweetId must be a positive integer');
    }

    if (typeof body?.value !== 'string') {
      throw new BadRequestException('Tweet value must be a string');
    }

    if (body.title !== undefined && typeof body.title !== 'string') {
      throw new BadRequestException('Tweet title must be a string');
    }

    return this.tweetsService.updateTweet(id, body.value, body.title);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':tweetId')
  async removeTweet(@Param('tweetId') tweetId: string): Promise<void> {
    const id = Number(tweetId);
    if (!Number.isSafeInteger(id) || id <= 0) {
      throw new BadRequestException('tweetId must be a positive integer');
    }

    await this.tweetsService.removeTweet(id);
  }
}
