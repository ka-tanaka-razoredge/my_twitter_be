import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from './tag.entity';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private readonly tagsRepository: Repository<Tag>,
  ) {}

  async upsert(value: string, c?: string): Promise<Tag> {
    const tag = c === undefined ? { value } : { value, c };

    await this.tagsRepository.upsert(tag, ['value']);

    return this.tagsRepository.findOneByOrFail({ value });
  }

  async findByValue(value: string): Promise<Tag> {
    const tag = await this.tagsRepository.findOneBy({ value });

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    return tag;
  }
}
