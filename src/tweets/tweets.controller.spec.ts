import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TweetsController } from './tweets.controller';
import { TweetsService } from './tweets.service';
import { Tweet } from './tweet.entity';

describe('TweetsController', () => {
  let controller: TweetsController;
  let service: {
    createTweet: jest.Mock;
    findById: jest.Mock;
    updateTweet: jest.Mock;
  };

  beforeEach(async () => {
    service = {
      createTweet: jest.fn(),
      findById: jest.fn(),
      updateTweet: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TweetsController],
      providers: [
        {
          provide: TweetsService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<TweetsController>(TweetsController);
  });

  it('creates a tweet', async () => {
    const tweet = {
      tweetId: 1,
      index: 1,
      value: 'hello',
      title: null,
      createdAt: new Date(),
      modifiedAt: new Date(),
    } satisfies Tweet;

    service.createTweet.mockResolvedValue(tweet);

    await expect(controller.createTweet({ value: 'hello' })).resolves.toEqual(
      tweet,
    );
    expect(service.createTweet).toHaveBeenCalledWith('hello', undefined);
  });

  it('rejects a non-string value', async () => {
    await expect(controller.createTweet({ value: undefined })).rejects.toThrow(
      BadRequestException,
    );
  });

  it('rejects a non-string title', async () => {
    await expect(
      controller.createTweet({ value: 'hello', title: 1 }),
    ).rejects.toThrow(BadRequestException);
  });

  it('updates a tweet by ID', async () => {
    const tweet = {
      tweetId: 7,
      index: 7,
      value: 'updated value',
      title: null,
      createdAt: new Date(),
      modifiedAt: new Date(),
    } satisfies Tweet;
    service.updateTweet.mockResolvedValue(tweet);

    await expect(
      controller.updateTweet('7', { value: 'updated value' }),
    ).resolves.toEqual(tweet);
    expect(service.updateTweet).toHaveBeenCalledWith(
      7,
      'updated value',
      undefined,
    );
  });

  it('gets a tweet by ID', async () => {
    const tweet = {
      tweetId: 7,
      index: 7,
      value: 'tweet value',
      title: 'tweet title',
      createdAt: new Date(),
      modifiedAt: new Date(),
    } satisfies Tweet;
    service.findById.mockResolvedValue(tweet);

    await expect(controller.getTweet('7')).resolves.toEqual(tweet);
    expect(service.findById).toHaveBeenCalledWith(7);
  });
});
