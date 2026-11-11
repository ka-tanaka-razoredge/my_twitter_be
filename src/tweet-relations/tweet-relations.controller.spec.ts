import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TweetRelation } from './tweet-relation.entity';
import { TweetRelationsController } from './tweet-relations.controller';
import { TweetRelationsService } from './tweet-relations.service';

describe('TweetRelationsController', () => {
  let controller: TweetRelationsController;
  let service: {
    create: jest.Mock;
    findIncoming: jest.Mock;
    findOutgoing: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
  };

  beforeEach(async () => {
    service = {
      create: jest.fn(),
      findIncoming: jest.fn(),
      findOutgoing: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TweetRelationsController],
      providers: [
        {
          provide: TweetRelationsService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<TweetRelationsController>(TweetRelationsController);
  });

  it('creates a relation with a normalized verb', async () => {
    const relation = {
      id: 1,
      subject: 2,
      verb: 'replies_to',
      object: 3,
      index: null,
      created: new Date(),
      modified: new Date(),
    } satisfies TweetRelation;
    service.create.mockResolvedValue(relation);

    await expect(
      controller.create({ subject: 2, verb: ' replies_to ', object: 3 }),
    ).resolves.toEqual(relation);
    expect(service.create).toHaveBeenCalledWith({
      subject: 2,
      verb: 'replies_to',
      object: 3,
    });
  });

  it('defaults the verb to refer when creating a relation', async () => {
    const relation = {
      id: 1,
      subject: 2,
      verb: 'refer',
      object: 3,
      index: null,
      created: new Date(),
      modified: new Date(),
    } satisfies TweetRelation;
    service.create.mockResolvedValue(relation);

    await expect(controller.create({ subject: 2, object: 3 })).resolves.toEqual(
      relation,
    );
    expect(service.create).toHaveBeenCalledWith({
      subject: 2,
      verb: 'refer',
      object: 3,
    });
  });

  it('rejects an invalid relation identifier', async () => {
    await expect(controller.remove('0')).rejects.toThrow(BadRequestException);
  });

  it('finds outgoing relations by subject and verb', async () => {
    const relations: TweetRelation[] = [];
    service.findOutgoing.mockResolvedValue(relations);

    await expect(controller.findOutgoing('2', 'replies_to')).resolves.toEqual(
      relations,
    );
    expect(service.findOutgoing).toHaveBeenCalledWith(2, 'replies_to');
  });

  it('finds incoming relations by object and verb', async () => {
    const relations: TweetRelation[] = [];
    service.findIncoming.mockResolvedValue(relations);

    await expect(controller.findIncoming('3', 'replies_to')).resolves.toEqual(
      relations,
    );
    expect(service.findIncoming).toHaveBeenCalledWith(3, 'replies_to', 1, 5);
  });

  it('passes incoming relation pagination to the service', async () => {
    const relations: TweetRelation[] = [];
    service.findIncoming.mockResolvedValue(relations);

    await expect(
      controller.findIncoming('3', 'replies_to', '2', '10'),
    ).resolves.toEqual(relations);
    expect(service.findIncoming).toHaveBeenCalledWith(3, 'replies_to', 2, 10);
  });

  it('updates only fields supplied in the request', async () => {
    const relation = {
      id: 1,
      subject: 2,
      verb: 'quotes',
      object: 3,
      index: null,
      created: new Date(),
      modified: new Date(),
    } satisfies TweetRelation;
    service.update.mockResolvedValue(relation);

    await expect(controller.update('1', { verb: ' quotes ' })).resolves.toEqual(
      relation,
    );
    expect(service.update).toHaveBeenCalledWith(1, { verb: 'quotes' });
  });

  it('updates an index and permits clearing it', async () => {
    const relation = {
      id: 1,
      subject: 2,
      verb: 'refer',
      object: 3,
      index: 4,
      created: new Date(),
      modified: new Date(),
    } satisfies TweetRelation;
    service.update.mockResolvedValue(relation);

    await expect(controller.update('1', { index: 4 })).resolves.toEqual(
      relation,
    );
    expect(service.update).toHaveBeenLastCalledWith(1, { index: 4 });

    await expect(controller.update('1', { index: null })).resolves.toEqual(
      relation,
    );
    expect(service.update).toHaveBeenLastCalledWith(1, { index: null });
  });

  it('rejects a non-integer index', async () => {
    await expect(controller.update('1', { index: 1.5 })).rejects.toThrow(
      BadRequestException,
    );
  });

  it('rejects an empty update request', async () => {
    await expect(controller.update('1', {})).rejects.toThrow(
      BadRequestException,
    );
  });
});
