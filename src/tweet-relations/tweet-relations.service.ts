import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { TweetRelation } from './tweet-relation.entity';

type TweetRelationData = {
  subject: number;
  verb: string;
  object: number;
};

@Injectable()
export class TweetRelationsService {
  constructor(
    @InjectRepository(TweetRelation)
    private readonly tweetRelationsRepository: Repository<TweetRelation>,
  ) {}

  async findAll(filters: Partial<TweetRelationData>): Promise<TweetRelation[]> {
    return this.tweetRelationsRepository.find({
      where: filters,
      order: { created: 'DESC', id: 'DESC' },
    });
  }

  async findOutgoing(
    subjectId: number,
    verb: string,
  ): Promise<TweetRelation[]> {
    return this.findAll({ subject: subjectId, verb });
  }

  async findIncoming(
    objectId: number,
    verb: string,
    page: number = 1,
    limit: number = 5,
  ): Promise<TweetRelation[]> {
    return this.tweetRelationsRepository.find({
      where: { object: objectId, verb },
      order: { created: 'DESC', id: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async findById(id: number): Promise<TweetRelation> {
    const relation = await this.tweetRelationsRepository.findOneBy({ id });

    if (!relation) {
      throw new NotFoundException('Tweet relation not found');
    }

    return relation;
  }

  async create(data: TweetRelationData): Promise<TweetRelation> {
    return this.save(this.tweetRelationsRepository.create(data));
  }

  async update(
    id: number,
    data: Partial<TweetRelationData>,
  ): Promise<TweetRelation> {
    const relation = await this.findById(id);
    Object.assign(relation, data);

    return this.save(relation);
  }

  async remove(id: number): Promise<void> {
    const relation = await this.findById(id);
    await this.tweetRelationsRepository.remove(relation);
  }

  private async save(relation: TweetRelation): Promise<TweetRelation> {
    try {
      return await this.tweetRelationsRepository.save(relation);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error as QueryFailedError & { driverError?: { code?: string } })
          .driverError?.code === 'ER_DUP_ENTRY'
      ) {
        throw new ConflictException('Tweet relation already exists');
      }

      throw error;
    }
  }
}
