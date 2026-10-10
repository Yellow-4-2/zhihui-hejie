import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { CasesService, CreateCaseDto } from './cases.service';

@ApiTags('和解案件')
@Public()
@Controller('cases')
export class CasesController {
  constructor(private readonly service: CasesService) {}

  @Get()
  @ApiOperation({ summary: '获取案件列表（可按状态筛选）' })
  @ApiQuery({ name: 'status', required: false })
  findAll(@Query('status') status?: string) {
    return this.service.findAll(status);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取单个案件详情' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: '发起和解申请' })
  create(@Body() dto: CreateCaseDto) {
    return this.service.create(dto);
  }

  @Post(':id/accept')
  @ApiOperation({ summary: '受理并分配企业' })
  accept(@Param('id') id: string, @Body() body: { enterpriseId: string; enterpriseName: string }) {
    return this.service.accept(id, body.enterpriseId, body.enterpriseName);
  }

  @Post(':id/reject')
  @ApiOperation({ summary: '不受理' })
  reject(@Param('id') id: string, @Body() body: { remark: string }) {
    return this.service.reject(id, body.remark);
  }

  @Post(':id/propose')
  @ApiOperation({ summary: '发起和解建议' })
  propose(@Param('id') id: string, @Body() body: { content: string; referencedCaseIds: string[] }) {
    return this.service.propose(id, body.content, body.referencedCaseIds || []);
  }

  @Post(':id/consumer-confirm')
  @ApiOperation({ summary: '消费者确认（同意/不同意）' })
  consumerConfirm(@Param('id') id: string, @Body() body: { agreed: boolean }) {
    return this.service.consumerConfirm(id, body.agreed);
  }

  @Post(':id/committee-confirm')
  @ApiOperation({ summary: '消保委和解确认' })
  committeeConfirm(@Param('id') id: string, @Body() body: { agreed: boolean }) {
    return this.service.committeeConfirm(id, body.agreed);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: '企业完成和解（上传凭证）' })
  complete(@Param('id') id: string, @Body() body: { voucherImages: string[] }) {
    return this.service.complete(id, body.voucherImages || []);
  }

  @Post(':id/return-visit')
  @ApiOperation({ summary: '回访确认' })
  returnVisit(@Param('id') id: string, @Body() body: { remark: string }) {
    return this.service.returnVisit(id, body.remark);
  }

  @Post(':id/evaluate')
  @ApiOperation({ summary: '评价' })
  evaluate(@Param('id') id: string, @Body() body: { rating: 1 | 2 | 3 | 4 | 5; comment?: string }) {
    return this.service.evaluate(id, body.rating, body.comment);
  }
}
