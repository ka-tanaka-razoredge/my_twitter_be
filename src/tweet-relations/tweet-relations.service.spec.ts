import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TweetRelation } from './tweet-relation.entity';
import { TweetRelationsService } from './tweet-relations.service';

describe('TweetRelationsService', () => {
  let service: TweetRelationsService;
  let repository: {
    find: jest.Mock;
  };

  beforeEach(async () => {
    repository = {
      find: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TweetRelationsService,
        {
          provide: getRepositoryToken(TweetRelation),
          useValue: repository,
        },
      ],
    }).compile();

    service = module.get<TweetRelationsService>(TweetRelationsService);
  });

  it('sorts outgoing relations by index', async () => {
    repository.find.mockResolvedValue([]);

    await service.findOutgoing(2, 'replies_to');

    expect(repository.find).toHaveBeenCalledWith({
      where: { subject: 2, verb: 'replies_to' },
      order: { index: 'ASC', id: 'DESC' },
    });
  });

  it('sorts incoming relations by index', async () => {
    repository.find.mockResolvedValue([]);

    await service.findIncoming(3, 'replies_to', 2, 10);

    expect(repository.find).toHaveBeenCalledWith({
      where: { object: 3, verb: 'replies_to' },
      order: { index: 'ASC', id: 'DESC' },
      skip: 10,
      take: 10,
    });
  });
});
