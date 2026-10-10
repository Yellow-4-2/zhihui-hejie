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

const DB_KEY = 'zhj-mock-db-v1'

// ---------- 种子数据（与真实后端预置数据一致） ----------

// 用显式年月日构造时间，避免 iOS Safari 无法解析 'YYYY-MM-DD HH:mm' 格式
const T = {
  d1: new Date(2022, 8, 1, 9, 30).getTime(),
  d2: new Date(2022, 8, 2, 10, 0).getTime(),
  d3: new Date(2022, 8, 3, 11, 0).getTime(),
  d4: new Date(2022, 8, 4, 14, 0).getTime(),
  d5: new Date(2022, 8, 5, 15, 0).getTime(),
  d6: new Date(2022, 8, 6, 16, 0).getTime(),
  d7: new Date(2022, 8, 7, 17, 0).getTime(),
}

const SEED_CASES: ReconciliationCase[] = [
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
]

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
    caseSeq: 9,
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
  return `CASE-2022-${String(max + 1).padStart(4, '0')}`
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
