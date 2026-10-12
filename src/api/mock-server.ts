// 纯前端模拟后端：实现与 NestJS 服务相同的 /api 端点语义
// - 数据持久化在 localStorage，刷新页面不丢失，增删改查结果即时保存
// - 业务规则（案件状态流转、邮箱唯一、企业关联校验）与真实后端保持一致
// - 想切回真实后端：在 http.ts 把 USE_MOCK_API 改为 false 即可

import { CaseStatus, Role } from '@/types'
import type { ReconciliationCase, CaseLibraryEntry, Enterprise } from '@/types'

// ---------- 错误类型 ----------

/** 模拟 HTTP 异常：status + message，由 http 层统一转换成 Error 并处理 401 跳转 */
export class MockHttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
  }
}

// ---------- 数据结构 ----------

interface MockUserRecord {
  id: number
  name: string
  email: string
  password: string // 演示环境明文存储，仅存在于浏览器 localStorage
  role: Role
  enterpriseId?: string
}

type SafeUser = Omit<MockUserRecord, 'password'>

interface MockDB {
  cases: ReconciliationCase[]
  caseLibrary: CaseLibraryEntry[]
  enterprises: Enterprise[]
  users: MockUserRecord[]
  caseSeq: number // 案件 id 自增（c9、c10…）
  userSeq: number // 用户 id 自增（5、6…）
}

// v2：扩充演示数据（24 条案件、8 家企业、近 7 个月），换版本号让旧浏览器数据自动重新播种
const DB_KEY = 'zhj-mock-db-v2'

// ---------- 种子数据（与真实后端预置数据一致） ----------

// 时间相对「现在」生成：保证趋势图始终覆盖最近几个月，无论何时演示数据都不过期
const NOW = new Date()
const monthsAgo = (n: number, day: number, hour = 10, minute = 0) =>
  new Date(NOW.getFullYear(), NOW.getMonth() - n, day, hour, minute).getTime()
const daysAgo = (n: number, hour = 10, minute = 0) =>
  new Date(NOW.getFullYear(), NOW.getMonth(), NOW.getDate() - n, hour, minute).getTime()

const CONSUMER_PHONES: Record<string, string> = {
  张三: '13800000001',
  李四: '13800000002',
  王五: '13800000003',
  赵六: '13800000004',
}

const ENTERPRISE_NAMES: Record<string, string> = {
  e1: '海尔',
  e2: '美的',
  e3: '苏宁易购',
  e4: '格力',
  e5: '京东',
  e6: '小米',
  e7: '拼多多',
  e8: 'vivo',
}

/** 每种最终状态对应的标准流转轨迹 */
const FLOW: Record<CaseStatus, CaseStatus[]> = {
  [CaseStatus.PENDING]: [CaseStatus.PENDING],
  [CaseStatus.ACCEPTED]: [CaseStatus.PENDING, CaseStatus.ACCEPTED],
  [CaseStatus.IN_PROGRESS]: [CaseStatus.PENDING, CaseStatus.ACCEPTED, CaseStatus.IN_PROGRESS],
  [CaseStatus.COMPLETED]: [CaseStatus.PENDING, CaseStatus.ACCEPTED, CaseStatus.IN_PROGRESS, CaseStatus.COMPLETED],
  [CaseStatus.FAILED]: [CaseStatus.PENDING, CaseStatus.ACCEPTED, CaseStatus.IN_PROGRESS, CaseStatus.FAILED],
  [CaseStatus.FINISHED]: [CaseStatus.PENDING, CaseStatus.ACCEPTED, CaseStatus.IN_PROGRESS, CaseStatus.COMPLETED, CaseStatus.FINISHED],
  [CaseStatus.EVALUATED]: [CaseStatus.PENDING, CaseStatus.ACCEPTED, CaseStatus.IN_PROGRESS, CaseStatus.COMPLETED, CaseStatus.FINISHED, CaseStatus.EVALUATED],
  [CaseStatus.REJECTED]: [CaseStatus.PENDING, CaseStatus.REJECTED],
}

const SUGGESTION_TEXTS = [
  '建议企业依据三包政策妥善处理，保障消费者合法权益。',
  '建议企业与消费者协商一致，尽快完成维修或退换处理。',
  '建议企业主动联系消费者说明处理方案，并承担相应费用。',
  '建议企业核查产品问题，按承诺为消费者办理退换货。',
]
const VISIT_REMARKS = [
  '电话回访消费者，确认问题已解决，对处理结果满意。',
  '回访确认和解协议已履行完毕，双方无异议。',
  '消费者反馈企业已按约定处理，对调解效率表示认可。',
]
const EVAL_COMMENTS = [
  '消保委处理及时，企业服务到位，非常满意！',
  '调解进度快，结果公平合理，很满意。',
  '全程线上办理很方便，企业态度也不错。',
]

interface SeedSpec {
  status: CaseStatus
  consumer: string
  ent: string
  commodity: string
  amount: number
  desc: string
  /** 创建时间：n 个月前的第 fromDay 天 */
  from: number
  fromDay: number
  /** 最后流转时间：n 个月前的第 toDay 天（0 表示用 toDays 天前） */
  to: number
  toDay: number
  initiator?: Role
  rejectRemark?: string
}

// 24 条种子：覆盖全部 8 种状态、8 家企业、近 7 个月，消费者以张三/李四为主（与移动端演示账号对应）
const SPECS: SeedSpec[] = [
  { status: CaseStatus.FINISHED, consumer: '张三', ent: 'e1', commodity: '空调（噪音大）', amount: 2100, desc: '新空调运行噪音明显超标，影响夜间休息，要求上门检修或换新。', from: 6, fromDay: 5, to: 6, toDay: 2 },
  { status: CaseStatus.EVALUATED, consumer: '李四', ent: 'e2', commodity: '电烤箱（温控失灵）', amount: 950, desc: '烤箱实际温度与设定偏差超过 30 度，要求换新。', from: 6, fromDay: 8, to: 6, toDay: 1 },
  { status: CaseStatus.FINISHED, consumer: '张三', ent: 'e3', commodity: '电视机（屏幕花屏）', amount: 4500, desc: '电视使用三个月出现花屏，售后拖延处理，要求换新。', from: 5, fromDay: 12, to: 5, toDay: 5 },
  { status: CaseStatus.EVALUATED, consumer: '王五', ent: 'e5', commodity: '空气炸锅（涂层脱落）', amount: 320, desc: '炸锅内涂层大面积脱落，担心健康风险，要求退货。', from: 5, fromDay: 10, to: 5, toDay: 3 },
  { status: CaseStatus.FAILED, consumer: '张三', ent: 'e4', commodity: '除湿机（除湿无效）', amount: 1300, desc: '除湿机运行正常但除湿效果差，企业拒绝退换，双方无法达成一致。', from: 5, fromDay: 8, to: 5, toDay: 1 },
  { status: CaseStatus.FINISHED, consumer: '李四', ent: 'e1', commodity: '洗碗机（洗不干净）', amount: 3800, desc: '洗碗机多次清洗后餐具仍有残留，要求上门维修。', from: 4, fromDay: 15, to: 4, toDay: 8, initiator: Role.ENTERPRISE },
  { status: CaseStatus.EVALUATED, consumer: '张三', ent: 'e6', commodity: '手环（续航虚标）', amount: 250, desc: '手环实际续航仅为宣传的一半，要求退货退款。', from: 4, fromDay: 12, to: 4, toDay: 4 },
  { status: CaseStatus.FINISHED, consumer: '李四', ent: 'e7', commodity: '保温杯（保温差）', amount: 89, desc: '保温杯保温时长不足 2 小时，与宣传严重不符。', from: 4, fromDay: 9, to: 4, toDay: 2 },
  { status: CaseStatus.IN_PROGRESS, consumer: '王五', ent: 'e8', commodity: '手机（拍照发虚）', amount: 2800, desc: '新手机拍照对焦模糊，多次售后未解决，要求换机。', from: 4, fromDay: 14, to: 4, toDay: 1 },
  { status: CaseStatus.FINISHED, consumer: '张三', ent: 'e2', commodity: '电风扇（异响）', amount: 260, desc: '风扇高速档有异常噪音，要求更换新品。', from: 3, fromDay: 18, to: 3, toDay: 10 },
  { status: CaseStatus.EVALUATED, consumer: '李四', ent: 'e1', commodity: '净水器（出水异味）', amount: 1500, desc: '净水器过滤后仍有异味，要求检测或更换滤芯系统。', from: 3, fromDay: 15, to: 3, toDay: 7 },
  { status: CaseStatus.FAILED, consumer: '赵六', ent: 'e3', commodity: '冰柜（冷冻失效）', amount: 2200, desc: '冰柜冷冻室无法达到冷冻温度，企业只同意维修，消费者要求换机。', from: 3, fromDay: 12, to: 3, toDay: 4 },
  { status: CaseStatus.IN_PROGRESS, consumer: '张三', ent: 'e4', commodity: '热水器（水温不稳）', amount: 1900, desc: '热水器水温忽冷忽热，存在安全隐患，要求处理。', from: 3, fromDay: 10, to: 3, toDay: 2 },
  { status: CaseStatus.ACCEPTED, consumer: '王五', ent: 'e5', commodity: '蓝牙耳机（频繁断连）', amount: 450, desc: '耳机使用一周频繁断连，要求换新。', from: 3, fromDay: 8, to: 3, toDay: 1, initiator: Role.COMMITTEE_M },
  { status: CaseStatus.COMPLETED, consumer: '李四', ent: 'e6', commodity: '净水壶（滤芯发霉）', amount: 180, desc: '新滤芯未到期即发霉，要求退货并道歉。', from: 2, fromDay: 20, to: 2, toDay: 12 },
  { status: CaseStatus.FINISHED, consumer: '张三', ent: 'e8', commodity: '充电宝（鼓包）', amount: 160, desc: '充电宝使用半年出现鼓包，要求退货。', from: 2, fromDay: 18, to: 2, toDay: 9 },
  { status: CaseStatus.IN_PROGRESS, consumer: '李四', ent: 'e1', commodity: '燃气灶（打不着火）', amount: 700, desc: '燃气灶点火困难，多次报修未根治，要求换新。', from: 2, fromDay: 15, to: 2, toDay: 6 },
  { status: CaseStatus.ACCEPTED, consumer: '赵六', ent: 'e2', commodity: '破壁机（异响剧烈）', amount: 560, desc: '破壁机运行时异响剧烈并有烧焦味，要求检测处理。', from: 2, fromDay: 12, to: 2, toDay: 3 },
  { status: CaseStatus.COMPLETED, consumer: '张三', ent: 'e7', commodity: '数据线（接触不良）', amount: 39, desc: '数据线使用一周即接触不良，商家拒绝售后。', from: 1, fromDay: 24, to: 1, toDay: 15 },
  { status: CaseStatus.ACCEPTED, consumer: '李四', ent: 'e3', commodity: '电吹风（过热自动停机）', amount: 220, desc: '吹风机使用中过热保护频繁启动，要求换新。', from: 1, fromDay: 20, to: 1, toDay: 10 },
  { status: CaseStatus.PENDING, consumer: '王五', ent: 'e4', commodity: '加湿器（漏水）', amount: 300, desc: '加湿器底座漏水，弄湿桌面和地板，要求换新。', from: 1, fromDay: 16, to: 1, toDay: 16 },
  { status: CaseStatus.COMPLETED, consumer: '李四', ent: 'e1', commodity: '咖啡机（泵体故障）', amount: 1200, desc: '咖啡机萃取压力不足，检测为泵体故障，要求换新。', from: 0, fromDay: 0, to: 0, toDay: 2 },
  { status: CaseStatus.PENDING, consumer: '张三', ent: 'e5', commodity: '电子秤（称重不准）', amount: 65, desc: '电子秤两次称重数值差异明显，要求退货。', from: 0, fromDay: 0, to: 0, toDay: 4 },
  { status: CaseStatus.REJECTED, consumer: '王五', ent: 'e6', commodity: '会员服务（自动续费）', amount: 30, desc: '会员到期后被自动续费扣款，要求退款。', from: 0, fromDay: 0, to: 0, toDay: 6, rejectRemark: '该投诉涉及会员自动续费，建议先与平台客服关闭续费并协商退款，消保委可协助后续调解。' },
]

// 0 表示「本月内」：用 daysAgo 表达，避免月初演示时出现未来时间
function specTime(spec: Pick<SeedSpec, 'from' | 'fromDay' | 'to' | 'toDay'>, kind: 'from' | 'to'): number {
  if (kind === 'from') {
    return spec.from === 0 ? daysAgo(Math.max(spec.toDay + 2, 8)) : monthsAgo(spec.from, spec.fromDay)
  }
  return spec.to === 0 ? daysAgo(spec.toDay, 15, 30) : monthsAgo(spec.to, spec.toDay, 15, 30)
}

let voucherSeq = 0
const SEED_CASES: ReconciliationCase[] = SPECS.map((spec, i) => {
  const createdAt = specTime(spec, 'from')
  const updatedAt = specTime(spec, 'to')
  const flow = FLOW[spec.status]
  const consumer = spec.consumer
  const entName = ENTERPRISE_NAMES[spec.ent]
  const initiator = spec.initiator ?? Role.CONSUMER

  const timeline = flow.map((st, idx) => {
    const at = createdAt + Math.round(((updatedAt - createdAt) * idx) / Math.max(flow.length - 1, 1))
    let operator = '消保委'
    let remark = ''
    switch (st) {
      case CaseStatus.PENDING:
        operator = initiator === Role.ENTERPRISE ? `${entName}（入驻企业）` : initiator === Role.COMMITTEE_M ? '消保委' : `${consumer}（消费者）`
        remark = initiator === Role.CONSUMER ? '发起和解申请' : '录入和解申请'
        break
      case CaseStatus.ACCEPTED:
        remark = `核实情况属实，受理并分配至${entName}`
        break
      case CaseStatus.IN_PROGRESS:
        remark = '发起和解建议'
        break
      case CaseStatus.COMPLETED:
        operator = `${entName}（入驻企业）`
        remark = '与消费者达成一致，完成和解并上传凭证'
        break
      case CaseStatus.FAILED:
        remark = '双方未达成一致，和解终止'
        break
      case CaseStatus.FINISHED:
        remark = VISIT_REMARKS[i % VISIT_REMARKS.length]
        break
      case CaseStatus.EVALUATED:
        operator = `${consumer}（消费者）`
        remark = `完成满意度评价（${i % 3 === 2 ? 4 : 5}星）`
        break
      case CaseStatus.REJECTED:
        remark = spec.rejectRemark ?? '非消保委受理范围，不予受理'
        break
    }
    return { status: st, at, operator, remark }
  })

  const item: ReconciliationCase = {
    id: `c${i + 1}`,
    caseNo: `CASE-${new Date(createdAt).getFullYear()}-${String(i + 1).padStart(4, '0')}`,
    status: spec.status,
    consumerName: consumer,
    consumerPhone: CONSUMER_PHONES[consumer],
    commodity: spec.commodity,
    amount: spec.amount,
    description: spec.desc,
    initiator,
    createdAt,
    updatedAt,
    timeline,
  }
  if (spec.status === CaseStatus.REJECTED) {
    item.enterpriseName = entName
    item.rejectRemark = spec.rejectRemark ?? '非消保委受理范围，不予受理'
  } else {
    item.enterpriseId = spec.ent
    item.enterpriseName = entName
  }
  if (flow.length >= 3) {
    item.suggestion = {
      content: SUGGESTION_TEXTS[i % SUGGESTION_TEXTS.length],
      referencedCaseIds: [`cl${(i % 6) + 1}`],
      createdAt: timeline[2].at,
      author: '消保委',
    }
  }
  if (spec.status === CaseStatus.COMPLETED || spec.status === CaseStatus.FINISHED || spec.status === CaseStatus.EVALUATED) {
    item.completionVoucherImages = [`https://picsum.photos/seed/voucher${++voucherSeq}/400/300`]
  }
  if (spec.status === CaseStatus.FINISHED || spec.status === CaseStatus.EVALUATED) {
    item.returnVisitRemark = VISIT_REMARKS[i % VISIT_REMARKS.length]
    item.returnVisitedAt = updatedAt
  }
  if (spec.status === CaseStatus.EVALUATED) {
    item.evaluation = {
      rating: i % 3 === 2 ? 4 : 5,
      comment: EVAL_COMMENTS[i % EVAL_COMMENTS.length],
      createdAt: updatedAt,
    }
  }
  return item
})

const SEED_CASE_LIBRARY: CaseLibraryEntry[] = [
  {
    id: 'cl1', title: '冰箱不制冷退款纠纷', category: '家电售后',
    summary: '消费者购买冰箱后出现不制冷问题，要求退货退款，经消保委调解，企业同意换新并补偿。',
    suggestion: '建议企业核查产品质检报告，依据三包政策提供换新或退货，并补偿消费者运输损失。',
    status: CaseStatus.FINISHED, amount: 3000, createdAt: new Date('2022-03-12').getTime(),
  },
  {
    id: 'cl2', title: '在线课程退费纠纷', category: '在线教育',
    summary: '消费者报名在线课程后因服务质量要求退费，企业以已开课为由拒绝。',
    suggestion: '建议按未消费课时比例退款，企业应公示退费规则并优化服务说明。',
    status: CaseStatus.FINISHED, amount: 2800, createdAt: new Date('2022-04-05').getTime(),
  },
  {
    id: 'cl3', title: '手机流量扣费争议', category: '通信服务',
    summary: '消费者反映套餐外流量扣费未提醒，要求退还费用。',
    suggestion: '建议运营商完善流量提醒机制，退还争议期间套餐外费用。',
    status: CaseStatus.FINISHED, amount: 120, createdAt: new Date('2022-05-18').getTime(),
  },
  {
    id: 'cl4', title: '食品安全退一赔三', category: '食品',
    summary: '消费者购买到过期食品，要求退一赔三。',
    suggestion: '依据食品安全法，建议商家退款并赔偿，加强临期食品管理。',
    status: CaseStatus.FINISHED, amount: 450, createdAt: new Date('2022-06-22').getTime(),
  },
  {
    id: 'cl5', title: '洗衣机维修多次未解决', category: '家电售后',
    summary: '洗衣机维修两次仍无法正常使用，消费者要求换机。',
    suggestion: '依据三包政策两次维修仍不能正常使用应予换新，建议企业及时处理。',
    status: CaseStatus.FINISHED, amount: 2600, createdAt: new Date('2022-07-30').getTime(),
  },
  {
    id: 'cl6', title: '网购商品延迟发货', category: '网络购物',
    summary: '消费者付款后商家长期未发货，要求退款并赔偿。',
    suggestion: '建议商家依约发货或退款，并按平台规则补偿消费者。',
    status: CaseStatus.FINISHED, amount: 880, createdAt: new Date('2022-08-14').getTime(),
  },
]

const SEED_ENTERPRISES: Enterprise[] = [
  { id: 'e1', name: '海尔', category: '家电', contactPhone: '0571-88888001', settledAt: new Date('2021-06-15').getTime() },
  { id: 'e2', name: '美的', category: '家电', contactPhone: '0571-88888002', settledAt: new Date('2021-08-20').getTime() },
  { id: 'e3', name: '苏宁易购', category: '零售', contactPhone: '0571-88888003', settledAt: new Date('2022-01-10').getTime() },
  { id: 'e4', name: '格力', category: '家电', contactPhone: '0571-88888004', settledAt: new Date('2022-03-05').getTime() },
  { id: 'e5', name: '京东', category: '零售', contactPhone: '0571-88888005', settledAt: new Date('2022-06-01').getTime() },
  { id: 'e6', name: '小米', category: '数码', contactPhone: '0571-88888006', settledAt: new Date('2023-02-14').getTime() },
  { id: 'e7', name: '拼多多', category: '电商', contactPhone: '0571-88888007', settledAt: new Date('2023-09-08').getTime() },
  { id: 'e8', name: 'vivo', category: '手机', contactPhone: '0571-88888008', settledAt: new Date('2024-04-18').getTime() },
]

const SEED_USERS: MockUserRecord[] = [
  { id: 1, name: '消费者小王', email: 'consumer@test.com', password: '123456', role: Role.CONSUMER },
  { id: 2, name: '某品牌企业', email: 'enterprise@test.com', password: '123456', role: Role.ENTERPRISE, enterpriseId: 'e1' },
  { id: 3, name: '消保委调解员', email: 'committee-m@test.com', password: '123456', role: Role.COMMITTEE_M },
  { id: 4, name: '消保委管理员', email: 'committee-pc@test.com', password: '123456', role: Role.COMMITTEE_PC },
]

// ---------- 数据库读写 ----------

function loadDB(): MockDB {
  try {
    const raw = localStorage.getItem(DB_KEY)
    if (raw) return JSON.parse(raw) as MockDB
  } catch {
    /* 数据损坏时重新播种 */
  }
  const fresh: MockDB = {
    cases: SEED_CASES,
    caseLibrary: SEED_CASE_LIBRARY,
    enterprises: SEED_ENTERPRISES,
    users: SEED_USERS,
    caseSeq: 25,
    userSeq: 5,
  }
  saveDB(fresh)
  return fresh
}

function saveDB(db: MockDB) {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db))
  } catch {
    /* 存储不可用（如隐私模式）时静默降级为内存态 */
  }
}

// ---------- 工具函数 ----------

function sanitizeUser(u: MockUserRecord): SafeUser {
  const { password: _password, ...rest } = u
  return rest
}

function requireAuth(authHeader: string | null): SafeUser {
  const token = authHeader?.replace(/^Bearer\s+/i, '')
  const id = token?.startsWith('mock-') ? Number(token.slice(5)) : NaN
  const user = Number.isFinite(id) ? loadDB().users.find((u) => u.id === id) : undefined
  if (!user) throw new MockHttpError(401, '未登录或登录已失效')
  return sanitizeUser(user)
}

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function nextCaseNo(cases: ReconciliationCase[]): string {
  let max = 0
  for (const c of cases) {
    const m = /(\d+)$/.exec(c.caseNo)
    if (m) max = Math.max(max, parseInt(m[1], 10))
  }
  return `CASE-${NOW.getFullYear()}-${String(max + 1).padStart(4, '0')}`
}

function validateEnterpriseLink(role: Role, enterpriseId?: string) {
  if (role === Role.ENTERPRISE && !enterpriseId) {
    throw new MockHttpError(400, '企业角色必须填写关联企业ID')
  }
  if (role !== Role.ENTERPRISE && enterpriseId) {
    throw new MockHttpError(400, '仅企业角色可以关联企业ID')
  }
}

// ---------- 端点实现 ----------

/**
 * 统一路由入口：由 http 层在 USE_MOCK_API 模式下调用
 * @returns 可直接作为接口响应返回的数据（深拷贝，避免调用方误改库内数据）
 */
export function handleMockRequest(
  method: string,
  url: string,
  payload: unknown,
  authHeader: string | null,
): unknown {
  const db = loadDB()
  const [path, queryString] = url.split('?')
  const query = new URLSearchParams(queryString ?? '')
  const segments = path.replace(/^\/+|\/+$/g, '').split('/') // e.g. ['api','cases','c1','accept']
  const body = (payload ?? {}) as Record<string, unknown>
  const now = Date.now()

  // ---- 认证 ----
  if (segments[1] === 'auth') {
    if (segments[2] === 'login' && method === 'POST') {
      const email = String(body.email ?? '').trim()
      const password = String(body.password ?? '')
      const user = db.users.find((u) => u.email === email)
      // 账号不存在 / 密码错误统一提示，与真实后端一致
      if (!user || user.password !== password) {
        throw new MockHttpError(401, '邮箱或密码错误')
      }
      return deepClone({ accessToken: `mock-${user.id}`, user: sanitizeUser(user) })
    }
    if (segments[2] === 'profile' && method === 'GET') {
      return deepClone(requireAuth(authHeader))
    }
    throw new MockHttpError(404, '接口不存在')
  }

  // ---- 和解案件 ----
  if (segments[1] === 'cases') {
    const id = segments[2]

    if (!id) {
      if (method === 'GET') {
        const status = query.get('status') ?? ''
        const list = [...db.cases].sort((a, b) => b.updatedAt - a.updatedAt)
        return deepClone(status && status !== 'ALL' ? list.filter((c) => c.status === status) : list)
      }
      if (method === 'POST') {
        const consumerName = String(body.consumerName ?? '')
        if (!consumerName || !body.commodity) throw new MockHttpError(400, '请填写完整信息')
        const c: ReconciliationCase = {
          id: `c${db.caseSeq++}`,
          caseNo: nextCaseNo(db.cases),
          status: CaseStatus.PENDING,
          consumerName,
          consumerPhone: String(body.consumerPhone ?? ''),
          enterpriseName: body.enterpriseName ? String(body.enterpriseName) : undefined,
          commodity: String(body.commodity),
          amount: Number(body.amount ?? 0),
          description: String(body.description ?? ''),
          initiator: (body.initiator as Role) ?? Role.CONSUMER,
          createdAt: now,
          updatedAt: now,
          timeline: [{ status: CaseStatus.PENDING, at: now, operator: `${consumerName}（消费者）`, remark: '发起和解申请' }],
        }
        db.cases.unshift(c)
        saveDB(db)
        return deepClone(c)
      }
      throw new MockHttpError(404, '接口不存在')
    }

    const c = db.cases.find((x) => x.id === id)
    if (!c) throw new MockHttpError(404, '案件不存在')
    const action = segments[3]

    const pushTimeline = (status: CaseStatus, operator: string, remark: string) => {
      c.timeline.push({ status, at: now, operator, remark })
      c.updatedAt = now
    }

    switch (action) {
      case undefined: {
        if (method !== 'GET') throw new MockHttpError(404, '接口不存在')
        return deepClone(c)
      }
      case 'accept': {
        if (c.status !== CaseStatus.PENDING) throw new MockHttpError(400, '只有待受理案件可受理')
        const enterpriseName = String(body.enterpriseName ?? '')
        c.enterpriseId = String(body.enterpriseId ?? '')
        c.enterpriseName = enterpriseName
        c.status = CaseStatus.ACCEPTED
        pushTimeline(CaseStatus.ACCEPTED, '消保委', `核实情况属实，受理并分配至${enterpriseName}`)
        break
      }
      case 'reject': {
        if (c.status !== CaseStatus.PENDING) throw new MockHttpError(400, '只有待受理案件可拒绝')
        const remark = String(body.remark ?? '')
        c.status = CaseStatus.REJECTED
        c.rejectRemark = remark
        pushTimeline(CaseStatus.REJECTED, '消保委', remark || '不予受理')
        break
      }
      case 'propose': {
        if (c.status !== CaseStatus.ACCEPTED) throw new MockHttpError(400, '只有已受理案件可发起和解建议')
        const referencedCaseIds = Array.isArray(body.referencedCaseIds) ? (body.referencedCaseIds as string[]) : []
        c.suggestion = { content: String(body.content ?? ''), referencedCaseIds, createdAt: now, author: '消保委' }
        c.status = CaseStatus.IN_PROGRESS
        pushTimeline(CaseStatus.IN_PROGRESS, '消保委', '发起和解建议' + (referencedCaseIds.length ? '，并引用案例库参考' : ''))
        break
      }
      case 'consumer-confirm': {
        if (c.status !== CaseStatus.IN_PROGRESS) throw new MockHttpError(400, '只有和解中案件可确认')
        const agreed = Boolean(body.agreed)
        c.status = agreed ? CaseStatus.COMPLETED : CaseStatus.FAILED
        pushTimeline(c.status, '消费者', agreed ? '同意和解方案' : '不同意和解方案')
        break
      }
      case 'committee-confirm': {
        if (c.status !== CaseStatus.IN_PROGRESS) throw new MockHttpError(400, '只有和解中案件可确认')
        const agreed = Boolean(body.agreed)
        c.status = agreed ? CaseStatus.COMPLETED : CaseStatus.FAILED
        pushTimeline(c.status, '消保委', agreed ? '消费者确认同意，和解完成' : '消费者不同意，和解失败')
        break
      }
      case 'complete': {
        if (c.status !== CaseStatus.IN_PROGRESS) throw new MockHttpError(400, '只有和解中案件可完成和解')
        c.completionVoucherImages = Array.isArray(body.voucherImages) ? (body.voucherImages as string[]) : []
        c.status = CaseStatus.COMPLETED
        pushTimeline(CaseStatus.COMPLETED, '入驻企业', '与消费者达成一致，完成和解并上传凭证')
        break
      }
      case 'return-visit': {
        if (c.status !== CaseStatus.COMPLETED) throw new MockHttpError(400, '只有和解完成案件可回访')
        const remark = String(body.remark ?? '')
        c.status = CaseStatus.FINISHED
        c.returnVisitRemark = remark
        c.returnVisitedAt = now
        pushTimeline(CaseStatus.FINISHED, '消保委', `回访确认：${remark}`)
        break
      }
      case 'evaluate': {
        if (c.status !== CaseStatus.FINISHED) throw new MockHttpError(400, '只有已完结案件可评价')
        c.evaluation = { rating: Number(body.rating ?? 5) as 1 | 2 | 3 | 4 | 5, comment: body.comment ? String(body.comment) : undefined, createdAt: now }
        c.status = CaseStatus.EVALUATED
        pushTimeline(CaseStatus.EVALUATED, '消费者', `评价满意（${c.evaluation.rating}星）`)
        break
      }
      default:
        throw new MockHttpError(404, '接口不存在')
    }

    saveDB(db)
    return deepClone(c)
  }

  // ---- 案例库 ----
  if (segments[1] === 'case-library') {
    const id = segments[2]
    if (!id && method === 'GET') {
      const keyword = (query.get('keyword') ?? '').trim()
      const list = keyword
        ? db.caseLibrary.filter((e) => e.title.includes(keyword) || e.category.includes(keyword) || e.summary.includes(keyword))
        : db.caseLibrary
      return deepClone(list)
    }
    const entry = db.caseLibrary.find((e) => e.id === id)
    if (!entry) throw new MockHttpError(404, '案例不存在')
    return deepClone(entry)
  }

  // ---- 入驻企业 ----
  if (segments[1] === 'enterprises') {
    const id = segments[2]
    if (!id && method === 'GET') {
      const keyword = (query.get('keyword') ?? '').trim()
      const list = keyword ? db.enterprises.filter((e) => e.name.includes(keyword) || e.category.includes(keyword)) : db.enterprises
      return deepClone(list)
    }
    if (!id && method === 'POST') {
      const name = String(body.name ?? '').trim()
      const category = String(body.category ?? '').trim()
      const contactPhone = String(body.contactPhone ?? '').trim()
      if (!name || !category || !contactPhone) throw new MockHttpError(400, '请填写完整信息')
      if (db.enterprises.some((e) => e.name === name)) throw new MockHttpError(409, '该企业已入驻')
      const maxNum = db.enterprises.reduce((max, e) => {
        const m = e.id.match(/^e(\d+)$/)
        return m ? Math.max(max, parseInt(m[1], 10)) : max
      }, 0)
      const ent: Enterprise = {
        id: `e${maxNum + 1}`,
        name,
        category,
        contactPhone,
        settledAt: Date.now(),
      }
      db.enterprises.push(ent)
      saveDB(db)
      return deepClone(ent)
    }
    const ent = db.enterprises.find((e) => e.id === id)
    if (!ent) throw new MockHttpError(404, '企业不存在')
    return deepClone(ent)
  }

  // ---- 用户管理（全部需要登录） ----
  if (segments[1] === 'users') {
    requireAuth(authHeader)
    const id = segments[2] ? Number(segments[2]) : NaN

    if (!segments[2]) {
      if (method === 'GET') {
        const keyword = (query.get('keyword') ?? '').trim()
        const list = db.users
          .filter((u) => !keyword || u.name.includes(keyword) || u.email.includes(keyword))
          .sort((a, b) => a.id - b.id)
        return deepClone(list.map(sanitizeUser))
      }
      if (method === 'POST') {
        const email = String(body.email ?? '').trim()
        if (!body.name || !email || !body.password || !body.role) throw new MockHttpError(400, '请填写完整信息')
        if (db.users.some((u) => u.email === email)) throw new MockHttpError(409, '该邮箱已被注册')
        const role = body.role as Role
        const enterpriseId = body.enterpriseId ? String(body.enterpriseId) : undefined
        validateEnterpriseLink(role, enterpriseId)
        const user: MockUserRecord = {
          id: db.userSeq++,
          name: String(body.name),
          email,
          password: String(body.password),
          role,
          enterpriseId,
        }
        db.users.push(user)
        saveDB(db)
        return deepClone(sanitizeUser(user))
      }
      throw new MockHttpError(404, '接口不存在')
    }

    const user = db.users.find((u) => u.id === id)
    if (!user) throw new MockHttpError(404, '用户不存在')

    if (method === 'GET') return deepClone(sanitizeUser(user))

    if (method === 'PUT') {
      const email = body.email !== undefined ? String(body.email).trim() : undefined
      if (email && email !== user.email && db.users.some((u) => u.email === email)) {
        throw new MockHttpError(409, '该邮箱已被其他用户使用')
      }
      const nextRole = (body.role as Role | undefined) ?? user.role
      let nextEnterpriseId = body.enterpriseId !== undefined ? (body.enterpriseId ? String(body.enterpriseId) : undefined) : user.enterpriseId
      // 角色不再是企业时，企业关联自动失效（与真实后端领域规则一致）
      if (nextRole !== Role.ENTERPRISE) nextEnterpriseId = undefined
      validateEnterpriseLink(nextRole, nextEnterpriseId)

      if (email !== undefined) user.email = email
      if (body.name !== undefined) user.name = String(body.name)
      if (body.password) user.password = String(body.password)
      user.role = nextRole
      user.enterpriseId = nextEnterpriseId
      saveDB(db)
      return deepClone(sanitizeUser(user))
    }

    if (method === 'DELETE') {
      db.users = db.users.filter((u) => u.id !== id)
      saveDB(db)
      return { id }
    }

    throw new MockHttpError(404, '接口不存在')
  }

  throw new MockHttpError(404, '接口不存在')
}
