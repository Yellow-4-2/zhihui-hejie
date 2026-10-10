import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { CaseLibraryService } from './case-library.service';

@ApiTags('案例库')
@Public()
@Controller('case-library')
export class CaseLibraryController {
  constructor(private readonly service: CaseLibraryService) {}

  @Get()
  @ApiOperation({ summary: '获取案例库列表（可搜索）' })
  @ApiQuery({ name: 'keyword', required: false })
  findAll(@Query('keyword') keyword?: string) {
    return this.service.findAll(keyword);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取单个案例详情' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
