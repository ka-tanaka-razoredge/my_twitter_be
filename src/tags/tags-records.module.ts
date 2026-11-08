import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TagEntity } from './tag-entity.entity';
import { TagsRecordsController } from './tags-records.controller';
import { TagsRecordsService } from './tags-records.service';

@Module({
  imports: [TypeOrmModule.forFeature([TagEntity])],
  providers: [TagsRecordsService],
  controllers: [TagsRecordsController],
})
export class TagsRecordsModule {}
