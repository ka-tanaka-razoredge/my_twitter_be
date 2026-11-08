import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TagEntity } from './tag-entity.entity';
import { TagsRecordsService } from './tags-records.service';

function isPositiveSafeInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value > 0;
}

@Controller('tags-records')
export class TagsRecordsController {
  constructor(private readonly tagsRecordsService: TagsRecordsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async create(
    @Body()
    body: { tag_id?: unknown; table_name?: unknown; record_id?: unknown },
  ): Promise<TagEntity> {
    if (!isPositiveSafeInteger(body?.tag_id)) {
      throw new BadRequestException('tag_id must be a positive integer');
    }

    if (
      typeof body?.table_name !== 'string' ||
      !body.table_name.trim() ||
      body.table_name.length > 255
    ) {
      throw new BadRequestException(
        'table_name must be a non-empty string up to 255 characters',
      );
    }

    if (!isPositiveSafeInteger(body?.record_id)) {
      throw new BadRequestException('record_id must be a positive integer');
    }

    return this.tagsRecordsService.create(
      body.tag_id,
      body.table_name.trim(),
      body.record_id,
    );
  }
}
