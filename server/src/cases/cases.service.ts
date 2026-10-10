import {
  Injectable,
  OnModuleInit,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

// 状态枚举
export enum CaseStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  FINISHED = 'FINISHED',
  EVALUATED = 'EVALUATED',
}

export enum Role {
  COMMITTEE_PC = 'committee_pc',
  COMMITTEE_M = 'committee_m',
  CONSUMER = 'consumer',
  ENTERPRISE = 'enterprise',
}

interface StatusTimelineItem {
  status: CaseStatus;
  at: number;
  operator: string;
  remark?: string;
}

interface ReconciliationSuggestion {
  content: string;
  referencedCaseIds: string[];
  createdAt: number;
  author: string;
}

interface Evaluation {
  rating: 1 | 2 | 3 | 4 | 5;
  comment?: string;
  createdAt: number;
}

export interface ReconciliationCase {
  id: string;
  caseNo: string;
  status: CaseStatus;
  consumerName: string;
  consumerPhone: string;
  enterpriseId?: string;
  enterpriseName?: string;
  commodity: string;
  amount: number;
  description: string;
  initiator: Role;
  createdAt: number;
  updatedAt: number;
  rejectRemark?: string;
  suggestion?: ReconciliationSuggestion;
  completionVoucherImages?: string[];
  returnVisitRemark?: string;
  returnVisitedAt?: number;
  evaluation?: Evaluation;
  timeline: StatusTimelineItem[];
}

export interface CreateCaseDto {
  consumerName: string;
  consumerPhone: string;
  enterpriseName?: string;
  commodity: string;
  amount: number;
  description: string;
  initiator: Role;
}

@Injectable()
export class CasesService implements OnModuleInit {
  private cases: ReconciliationCase[] = [];
  private idSeq = 9;

  onModuleInit() {
    const T = {
      d1: new Date('2022-09-01 09:30').getTime(),
      d2: new Date('2022-09-02 10:00').getTime(),
      d3: new Date('2022-09-03 11:00').getTime(),
      d4: new Date('2022-09-04 14:00').getTime(),
      d5: new Date('2022-09-05 15:00').getTime(),
      d6: new Date('2022-09-06 16:00').getTime(),
      d7: new Date('2022-09-07 17:00').getTime(),
    };

    this.cases = [
      {
        id: 'c1', caseNo: 'CASE-2022-0001', status: CaseStatus.PENDING,
        consumerName: '张三', consumerPhone: '13800000001', enterpriseName: '海尔',
        commodity: '冰箱（不制冷）', amount: 3000,
        description: '购买不到一个月冰箱不制冷，要求换新，售后只同意维修。',
        initiator: Role.CONSUMER, createdAt: T.d1, updatedAt: T.d1,
        timeline: [{ status: CaseStatus.PENDING, at: T.d1, operator: '张三（消费者）', remark: '发起和解申请' }],
      },
      {
        id: 'c2', caseNo: 'CASE-2022-0002', status: CaseStatus.ACCEPTED,
        consumerName: '李四', consumerPhone: '13800000002', enterpriseId: 'e2', enterpriseName: '美的',
        commodity: '洗衣机（多次维修）', amount: 800,
        description: '洗衣机维修两次仍无法正常使用，要求换机。',
        initiator: Role.COMMITTEE_M, createdAt: T.d1, updatedAt: T.d2,
        timeline: [
          { status: CaseStatus.PENDING, at: T.d1, operator: '消保委', remark: '录入和解申请' },
          { status: CaseStatus.ACCEPTED, at: T.d2, operator: '消保委', remark: '核实情况属实，受理并分配至美的' },
        ],
      },
      {
        id: 'c3', caseNo: 'CASE-2022-0003', status: CaseStatus.IN_PROGRESS,
        consumerName: '张三', consumerPhone: '13800000001', enterpriseId: 'e3', enterpriseName: '苏宁易购',
        commodity: '网购商品（延迟发货）', amount: 500,
        description: '付款后商家长期未发货，要求退款并赔偿。',
        initiator: Role.CONSUMER, createdAt: T.d1, updatedAt: T.d3,
        suggestion: { content: '建议商家依据平台规则及时发货或退款，并补偿消费者延迟损失。', referencedCaseIds: ['cl6'], createdAt: T.d3, author: '消保委' },
        timeline: [
          { status: CaseStatus.PENDING, at: T.d1, operator: '张三（消费者）', remark: '发起和解申请' },
          { status: CaseStatus.ACCEPTED, at: T.d2, operator: '消保委', remark: '受理并分配至苏宁易购' },
          { status: CaseStatus.IN_PROGRESS, at: T.d3, operator: '消保委', remark: '发起和解建议，并引用案例库参考' },
        ],
      },
      {
        id: 'c4', caseNo: 'CASE-2022-0004', status: CaseStatus.COMPLETED,
        consumerName: '李四', consumerPhone: '13800000002', enterpriseId: 'e1', enterpriseName: '海尔',
        commodity: '冰箱（噪音大）', amount: 2600,
        description: '冰箱噪音超标，要求换新。',
        initiator: Role.ENTERPRISE, createdAt: T.d1, updatedAt: T.d4,
        suggestion: { content: '建议企业上门检测，噪音超标予以换新处理。', referencedCaseIds: ['cl5'], createdAt: T.d3, author: '消保委' },
        completionVoucherImages: ['https://via.placeholder.com/150?text=voucher1'],
        timeline: [
          { status: CaseStatus.PENDING, at: T.d1, operator: '海尔（入驻企业）', remark: '录入和解申请' },
          { status: CaseStatus.ACCEPTED, at: T.d2, operator: '消保委', remark: '受理并分配至海尔' },
          { status: CaseStatus.IN_PROGRESS, at: T.d3, operator: '消保委', remark: '发起和解建议' },
          { status: CaseStatus.COMPLETED, at: T.d4, operator: '海尔（入驻企业）', remark: '与消费者达成一致，上传和解完成凭证' },
        ],
      },
      {
        id: 'c5', caseNo: 'CASE-2022-0005', status: CaseStatus.FAILED,
        consumerName: '张三', consumerPhone: '13800000001', enterpriseId: 'e4', enterpriseName: '格力',
        commodity: '空调（制冷效果差）', amount: 3200,
        description: '空调制冷效果差，要求换机，企业只同意加氟维修。',
        initiator: Role.CONSUMER, createdAt: T.d1, updatedAt: T.d5,
        suggestion: { content: '建议企业检测后若不达标予以换机，并承担检测费用。', referencedCaseIds: ['cl5'], createdAt: T.d3, author: '消保委' },
        timeline: [
          { status: CaseStatus.PENDING, at: T.d1, operator: '张三（消费者）', remark: '发起和解申请' },
          { status: CaseStatus.ACCEPTED, at: T.d2, operator: '消保委', remark: '受理并分配至格力' },
          { status: CaseStatus.IN_PROGRESS, at: T.d3, operator: '消保委', remark: '发起和解建议' },
          { status: CaseStatus.FAILED, at: T.d5, operator: '消保委', remark: '消费者不同意和解方案' },
        ],
      },
      {
        id: 'c6', caseNo: 'CASE-2022-0006', status: CaseStatus.FINISHED,
        consumerName: '李四', consumerPhone: '13800000002', enterpriseId: 'e2', enterpriseName: '美的',
        commodity: '电饭煲（内胆变形）', amount: 400,
        description: '内胆使用一周变形，要求更换内胆。',
        initiator: Role.CONSUMER, createdAt: T.d1, updatedAt: T.d6,
        suggestion: { content: '建议企业免费更换内胆并致歉。', referencedCaseIds: ['cl1'], createdAt: T.d3, author: '消保委' },
        completionVoucherImages: ['https://via.placeholder.com/150?text=voucher2'],
        returnVisitRemark: '电话回访消费者，确认已更换内胆，对处理满意。',
        returnVisitedAt: T.d6,
        timeline: [
          { status: CaseStatus.PENDING, at: T.d1, operator: '李四（消费者）', remark: '发起和解申请' },
          { status: CaseStatus.ACCEPTED, at: T.d2, operator: '消保委', remark: '受理并分配至美的' },
          { status: CaseStatus.IN_PROGRESS, at: T.d3, operator: '消保委', remark: '发起和解建议' },
          { status: CaseStatus.COMPLETED, at: T.d4, operator: '美的（入驻企业）', remark: '完成和解，更换内胆' },
          { status: CaseStatus.FINISHED, at: T.d6, operator: '消保委', remark: '回访确认和解成功' },
        ],
      },
      {
        id: 'c7', caseNo: 'CASE-2022-0007', status: CaseStatus.EVALUATED,
        consumerName: '张三', consumerPhone: '13800000001', enterpriseId: 'e1', enterpriseName: '海尔',
        commodity: '热水器（漏水）', amount: 1800,
        description: '新热水器使用漏水，要求换新。',
        initiator: Role.CONSUMER, createdAt: T.d1, updatedAt: T.d7,
        suggestion: { content: '建议企业上门确认漏水原因，非人为损坏予以换新。', referencedCaseIds: ['cl1', 'cl5'], createdAt: T.d3, author: '消保委' },
        completionVoucherImages: ['https://via.placeholder.com/150?text=voucher3'],
        returnVisitRemark: '已换新，消费者满意。',
        returnVisitedAt: T.d6,
        evaluation: { rating: 5, comment: '消保委处理及时，企业服务到位，非常满意！', createdAt: T.d7 },
        timeline: [
          { status: CaseStatus.PENDING, at: T.d1, operator: '张三（消费者）', remark: '发起和解申请' },
          { status: CaseStatus.ACCEPTED, at: T.d2, operator: '消保委', remark: '受理并分配至海尔' },
          { status: CaseStatus.IN_PROGRESS, at: T.d3, operator: '消保委', remark: '发起和解建议' },
          { status: CaseStatus.COMPLETED, at: T.d4, operator: '海尔（入驻企业）', remark: '完成和解，予以换新' },
          { status: CaseStatus.FINISHED, at: T.d6, operator: '消保委', remark: '回访确认和解成功' },
          { status: CaseStatus.EVALUATED, at: T.d7, operator: '张三（消费者）', remark: '评价满意（5星）' },
        ],
      },
      {
        id: 'c8', caseNo: 'CASE-2022-0008', status: CaseStatus.REJECTED,
        consumerName: '张三', consumerPhone: '13800000001', enterpriseName: '苏宁易购',
        commodity: '虚拟商品（会员权益）', amount: 200,
        description: '购买虚拟会员后反悔要求退款。',
        initiator: Role.CONSUMER, createdAt: T.d1, updatedAt: T.d2,
        rejectRemark: '虚拟商品一经开通使用不在消保委受理范围，建议与商家协商。',
        timeline: [
          { status: CaseStatus.PENDING, at: T.d1, operator: '张三（消费者）', remark: '发起和解申请' },
          { status: CaseStatus.REJECTED, at: T.d2, operator: '消保委', remark: '非消保委受理范围，不予受理' },
        ],
      },
    ];
  }

  findAll(status?: string): ReconciliationCase[] {
    const list = [...this.cases].sort((a, b) => b.updatedAt - a.updatedAt);
    if (!status || status === 'ALL') return list;
    return list.filter((c) => c.status === status);
  }

  findOne(id: string): ReconciliationCase {
    const c = this.cases.find((x) => x.id === id);
    if (!c) throw new NotFoundException('案件不存在');
    return c;
  }

  private nextSeq(): number {
    let max = 0;
    for (const c of this.cases) {
      const m = /(\d+)$/.exec(c.caseNo);
      if (m) max = Math.max(max, parseInt(m[1], 10));
    }
    return max + 1;
  }

  create(dto: CreateCaseDto): ReconciliationCase {
    const now = Date.now();
    const seq = this.nextSeq();
    const c: ReconciliationCase = {
      id: `c${this.idSeq++}`,
      caseNo: `CASE-2022-${String(seq).padStart(4, '0')}`,
      status: CaseStatus.PENDING,
      consumerName: dto.consumerName,
      consumerPhone: dto.consumerPhone,
      enterpriseName: dto.enterpriseName,
      commodity: dto.commodity,
      amount: dto.amount,
      description: dto.description,
      initiator: dto.initiator,
      createdAt: now,
      updatedAt: now,
      timeline: [
        { status: CaseStatus.PENDING, at: now, operator: dto.consumerName + '（消费者）', remark: '发起和解申请' },
      ],
    };
    this.cases.unshift(c);
    return c;
  }

  private pushTimeline(c: ReconciliationCase, item: StatusTimelineItem) {
    c.timeline.push(item);
    c.updatedAt = item.at;
  }

  accept(id: string, enterpriseId: string, enterpriseName: string): ReconciliationCase {
    const c = this.findOne(id);
    if (c.status !== CaseStatus.PENDING) throw new BadRequestException('只有待受理案件可受理');
    c.enterpriseId = enterpriseId;
    c.enterpriseName = enterpriseName;
    c.status = CaseStatus.ACCEPTED;
    this.pushTimeline(c, { status: CaseStatus.ACCEPTED, at: Date.now(), operator: '消保委', remark: `核实情况属实，受理并分配至${enterpriseName}` });
    return c;
  }

  reject(id: string, remark: string): ReconciliationCase {
    const c = this.findOne(id);
    if (c.status !== CaseStatus.PENDING) throw new BadRequestException('只有待受理案件可拒绝');
    c.status = CaseStatus.REJECTED;
    c.rejectRemark = remark;
    this.pushTimeline(c, { status: CaseStatus.REJECTED, at: Date.now(), operator: '消保委', remark: remark || '不予受理' });
    return c;
  }

  propose(id: string, content: string, referencedCaseIds: string[]): ReconciliationCase {
    const c = this.findOne(id);
    if (c.status !== CaseStatus.ACCEPTED) throw new BadRequestException('只有已受理案件可发起和解建议');
    c.suggestion = { content, referencedCaseIds, createdAt: Date.now(), author: '消保委' };
    c.status = CaseStatus.IN_PROGRESS;
    this.pushTimeline(c, { status: CaseStatus.IN_PROGRESS, at: Date.now(), operator: '消保委', remark: '发起和解建议' + (referencedCaseIds.length ? '，并引用案例库参考' : '') });
    return c;
  }

  consumerConfirm(id: string, agreed: boolean): ReconciliationCase {
    const c = this.findOne(id);
    if (c.status !== CaseStatus.IN_PROGRESS) throw new BadRequestException('只有和解中案件可确认');
    c.status = agreed ? CaseStatus.COMPLETED : CaseStatus.FAILED;
    this.pushTimeline(c, { status: c.status, at: Date.now(), operator: '消费者', remark: agreed ? '同意和解方案' : '不同意和解方案' });
    return c;
  }

  committeeConfirm(id: string, agreed: boolean): ReconciliationCase {
    const c = this.findOne(id);
    if (c.status !== CaseStatus.IN_PROGRESS) throw new BadRequestException('只有和解中案件可确认');
    c.status = agreed ? CaseStatus.COMPLETED : CaseStatus.FAILED;
    this.pushTimeline(c, { status: c.status, at: Date.now(), operator: '消保委', remark: agreed ? '消费者确认同意，和解完成' : '消费者不同意，和解失败' });
    return c;
  }

  complete(id: string, voucherImages: string[]): ReconciliationCase {
    const c = this.findOne(id);
    if (c.status !== CaseStatus.IN_PROGRESS) throw new BadRequestException('只有和解中案件可完成和解');
    c.completionVoucherImages = voucherImages;
    c.status = CaseStatus.COMPLETED;
    this.pushTimeline(c, { status: CaseStatus.COMPLETED, at: Date.now(), operator: '入驻企业', remark: '与消费者达成一致，完成和解并上传凭证' });
    return c;
  }

  returnVisit(id: string, remark: string): ReconciliationCase {
    const c = this.findOne(id);
    if (c.status !== CaseStatus.COMPLETED) throw new BadRequestException('只有和解完成案件可回访');
    c.status = CaseStatus.FINISHED;
    c.returnVisitRemark = remark;
    c.returnVisitedAt = Date.now();
    this.pushTimeline(c, { status: CaseStatus.FINISHED, at: Date.now(), operator: '消保委', remark: `回访确认：${remark}` });
    return c;
  }

  evaluate(id: string, rating: 1 | 2 | 3 | 4 | 5, comment?: string): ReconciliationCase {
    const c = this.findOne(id);
    if (c.status !== CaseStatus.FINISHED) throw new BadRequestException('只有已完结案件可评价');
    c.evaluation = { rating, comment, createdAt: Date.now() };
    c.status = CaseStatus.EVALUATED;
    this.pushTimeline(c, { status: CaseStatus.EVALUATED, at: Date.now(), operator: '消费者', remark: `评价满意（${rating}星）` });
    return c;
  }
}
