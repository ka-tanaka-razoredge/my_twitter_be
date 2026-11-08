import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TagEntity } from './tag-entity.entity';

@Injectable()
export class TagsRecordsService {
  constructor(
    @InjectRepository(TagEntity)
    private readonly tagsRecordsRepository: Repository<TagEntity>,
  ) {}

  async create(
    tagId: number,
    tableName: string,
    recordId: number,
  ): Promise<TagEntity> {
    const tagRecord = this.tagsRecordsRepository.create({
      tag_id: tagId,
      table_name: tableName,
      record_id: recordId,
    });

    return this.tagsRecordsRepository.save(tagRecord);
  }
}
