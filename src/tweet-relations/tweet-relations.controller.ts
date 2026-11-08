import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TweetRelation } from './tweet-relation.entity';
import { TweetRelationsService } from './tweet-relations.service';

type TweetRelationBody = {
  subject?: unknown;
  verb?: unknown;
  object?: unknown;
};

function parsePositiveSafeInteger(value: unknown, name: string): number {
  const parsed = typeof value === 'number' ? value : Number(value);

  if (!Number.isSafeInteger(parsed) || parsed <= 0) {
    throw new BadRequestException(`${name} must be a positive integer`);
  }

  return parsed;
}

function parseVerb(value: unknown): string {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > 50) {
    throw new BadRequestException(
      'verb must be a non-empty string up to 50 characters',
    );
  }

  return value.trim();
}

@Controller('tweet-relations')
@UseGuards(AuthGuard('jwt'))
export class TweetRelationsController {
  constructor(private readonly tweetRelationsService: TweetRelationsService) {}

  @Get()
  async findAll(
    @Query('subject') subject?: string,
    @Query('verb') verb?: string,
    @Query('object') object?: string,
  ): Promise<TweetRelation[]> {
    return this.tweetRelationsService.findAll({
      ...(subject === undefined
        ? {}
        : { subject: parsePositiveSafeInteger(subject, 'subject') }),
      ...(verb === undefined ? {} : { verb: parseVerb(verb) }),
      ...(object === undefined
        ? {}
        : { object: parsePositiveSafeInteger(object, 'object') }),
    });
  }

  @Get('outgoing')
  async findOutgoing(
    @Query('subject_id') subjectId?: string,
    @Query('verb') verb?: string,
  ): Promise<TweetRelation[]> {
    return this.tweetRelationsService.findOutgoing(
      parsePositiveSafeInteger(subjectId, 'subject_id'),
      parseVerb(verb),
    );
  }

  @Get('incoming')
  async findIncoming(
    @Query('object_id') objectId?: string,
    @Query('verb') verb?: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '5',
  ): Promise<TweetRelation[]> {
    return this.tweetRelationsService.findIncoming(
      parsePositiveSafeInteger(objectId, 'object_id'),
      parseVerb(verb),
      parsePositiveSafeInteger(page, 'page'),
      parsePositiveSafeInteger(limit, 'limit'),
    );
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<TweetRelation> {
    return this.tweetRelationsService.findById(
      parsePositiveSafeInteger(id, 'id'),
    );
  }

  @Post()
  async create(@Body() body: TweetRelationBody): Promise<TweetRelation> {
    return this.tweetRelationsService.create({
      subject: parsePositiveSafeInteger(body?.subject, 'subject'),
      verb: body?.verb === undefined ? 'refer' : parseVerb(body.verb),
      object: parsePositiveSafeInteger(body?.object, 'object'),
    });
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: TweetRelationBody,
  ): Promise<TweetRelation> {
    const data = {
      ...(body?.subject === undefined
        ? {}
        : { subject: parsePositiveSafeInteger(body.subject, 'subject') }),
      ...(body?.verb === undefined ? {} : { verb: parseVerb(body.verb) }),
      ...(body?.object === undefined
        ? {}
        : { object: parsePositiveSafeInteger(body.object, 'object') }),
    };

    if (Object.keys(data).length === 0) {
      throw new BadRequestException(
        'At least one of subject, verb, or object must be provided',
      );
    }

    return this.tweetRelationsService.update(
      parsePositiveSafeInteger(id, 'id'),
      data,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.tweetRelationsService.remove(parsePositiveSafeInteger(id, 'id'));
  }
}
