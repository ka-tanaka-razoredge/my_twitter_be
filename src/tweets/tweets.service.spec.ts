import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Tweet } from './tweet.entity';
import { TweetsService } from './tweets.service';

describe('TweetsService', () => {
  let service: TweetsService;
  let repository: {
    create: jest.Mock;
    find: jest.Mock;
    findOneBy: jest.Mock;
    query: jest.Mock;
    save: jest.Mock;
  };

  beforeEach(async () => {
    repository = {
      create: jest.fn(),
      find: jest.fn(),
      findOneBy: jest.fn(),
      query: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TweetsService,
        {
          provide: getRepositoryToken(Tweet),
          useValue: repository,
        },
      ],
    }).compile();

    service = module.get<TweetsService>(TweetsService);
  });

  it('creates and saves a trimmed tweet', async () => {
    const createdTweet = {
      value: 'hello world',
    };
    const savedTweet = {
      tweetId: 1,
      index: 1,
      value: 'hello world',
      title: null,
      createdAt: new Date(),
      modifiedAt: new Date(),
    } satisfies Tweet;

    repository.create.mockReturnValue(createdTweet);
    repository.save.mockResolvedValue(savedTweet);

    await expect(service.createTweet('  hello world  ')).resolves.toEqual(
      savedTweet,
    );
    expect(repository.create).toHaveBeenCalledWith({ value: 'hello world' });
    expect(repository.save).toHaveBeenCalledWith(createdTweet);
  });

  it('rejects an empty tweet', async () => {
    await expect(service.createTweet('   ')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('saves an optional title', async () => {
    const createdTweet = {
      value: 'hello world',
      title: 'headline',
    };
    const savedTweet = {
      tweetId: 1,
      index: 1,
      value: 'hello world',
      title: 'headline',
      createdAt: new Date(),
      modifiedAt: new Date(),
    } satisfies Tweet;

    repository.create.mockReturnValue(createdTweet);
    repository.save.mockResolvedValue(savedTweet);

    await expect(
      service.createTweet('hello world', 'headline'),
    ).resolves.toEqual(savedTweet);
    expect(repository.create).toHaveBeenCalledWith({
      value: 'hello world',
      title: 'headline',
    });
  });

  it('updates an existing tweet', async () => {
    const existingTweet = {
      tweetId: 7,
      index: 7,
      value: 'old value',
      title: 'old title',
      createdAt: new Date(),
      modifiedAt: new Date(),
    } satisfies Tweet;

    repository.findOneBy.mockResolvedValue(existingTweet);
    repository.save.mockResolvedValue(existingTweet);

    await expect(
      service.updateTweet(7, '  updated value  ', 'updated title'),
    ).resolves.toEqual(existingTweet);
    expect(repository.findOneBy).toHaveBeenCalledWith({ tweetId: 7 });
    expect(repository.save).toHaveBeenCalledWith({
      ...existingTweet,
      value: 'updated value',
      title: 'updated title',
    });
  });

  it('finds a tweet by ID', async () => {
    const tweet = {
      tweetId: 7,
      index: 7,
      value: 'tweet value',
      title: 'tweet title',
      createdAt: new Date(),
      modifiedAt: new Date(),
    } satisfies Tweet;
    repository.findOneBy.mockResolvedValue(tweet);

    await expect(service.findById(7)).resolves.toEqual(tweet);
    expect(repository.findOneBy).toHaveBeenCalledWith({ tweetId: 7 });
  });

  it('sorts untagged tweets by index', async () => {
    repository.find.mockResolvedValue([]);

    await service.findAll({ skip: 0, take: 10 });

    expect(repository.find).toHaveBeenCalledWith({
      skip: 0,
      take: 10,
      order: { index: 'ASC', tweetId: 'DESC' },
    });
  });

  it('sorts tagged tweets by index', async () => {
    repository.query.mockResolvedValue([]);

    await service.findAll({ skip: 0, take: 10, tagId: 1 });

    expect(repository.query).toHaveBeenCalledWith(
      expect.stringContaining('ORDER BY tweet.`index` ASC, tweet.tweet_id DESC'),
      [1, 10, 0],
    );
  });
});
