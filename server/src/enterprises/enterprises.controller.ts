import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { EnterprisesService } from './enterprises.service';

@ApiTags('入驻企业')
@Public()
@Controller('enterprises')
export class EnterprisesController {
  constructor(private readonly service: EnterprisesService) {}

  @Get()
  @ApiOperation({ summary: '获取企业列表（可搜索）' })
  @ApiQuery({ name: 'keyword', required: false })
  findAll(@Query('keyword') keyword?: string) {
    return this.service.findAll(keyword);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取单个企业详情' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
