import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Tag } from './tag.entity';
import { TagsService } from './tags.service';

@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async findByValue(@Query('value') value?: string): Promise<Tag> {
    const normalizedValue = value?.trim();

    if (!normalizedValue || normalizedValue.length > 255) {
      throw new BadRequestException(
        'value must be a non-empty string up to 255 characters',
      );
    }

    return this.tagsService.findByValue(normalizedValue);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async upsert(
    @Body() body: { value?: unknown; c?: unknown },
  ): Promise<Tag> {
    if (
      typeof body?.value !== 'string' ||
      !body.value.trim() ||
      body.value.trim().length > 255
    ) {
      throw new BadRequestException(
        'value must be a non-empty string up to 255 characters',
      );
    }

    if (body.c !== undefined && typeof body.c !== 'string') {
      throw new BadRequestException('c must be a string');
    }

    return this.tagsService.upsert(body.value.trim(), body.c);
  }
}
