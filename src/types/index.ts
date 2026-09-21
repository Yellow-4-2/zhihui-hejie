// 角色枚举
export enum Role {
  COMMITTEE_PC = 'committee_pc',
  COMMITTEE_M = 'committee_m',
  CONSUMER = 'consumer',
  ENTERPRISE = 'enterprise',
}

// 和解状态枚举
export enum CaseStatus {
  PENDING = 'PENDING', // 待受理
  ACCEPTED = 'ACCEPTED', // 已受理
  REJECTED = 'REJECTED', // 不受理
  IN_PROGRESS = 'IN_PROGRESS', // 和解中
  COMPLETED = 'COMPLETED', // 和解完成
  FAILED = 'FAILED', // 和解失败
  FINISHED = 'FINISHED', // 已完结
  EVALUATED = 'EVALUATED', // 已评价
}

// "全部"占位（仅列表使用）
export const STATUS_ALL = 'ALL'

// 状态时间线条目
export interface StatusTimelineItem {
  status: CaseStatus
  at: number
  operator: string
  remark?: string
}

// 和解建议
export interface ReconciliationSuggestion {
  content: string
  referencedCaseIds: string[]
  createdAt: number
  author: string
}

// 评价
export interface Evaluation {
  rating: 1 | 2 | 3 | 4 | 5
  comment?: string
  createdAt: number
}

// 和解案例
export interface ReconciliationCase {
  id: string
  caseNo: string
  status: CaseStatus
  consumerName: string
  consumerPhone: string
  enterpriseId?: string
  enterpriseName?: string
  commodity: string
  amount: number
  description: string
  initiator: Role
  createdAt: number
  updatedAt: number
  rejectRemark?: string
  suggestion?: ReconciliationSuggestion
  completionVoucherImages?: string[]
  returnVisitRemark?: string
  returnVisitedAt?: number
  evaluation?: Evaluation
  timeline: StatusTimelineItem[]
}

// 和解案例库条目
export interface CaseLibraryEntry {
  id: string
  title: string
  category: string
  summary: string
  suggestion: string
  status: CaseStatus
  amount: number
  createdAt: number
}

// 入驻企业
export interface Enterprise {
  id: string
  name: string
  category: string
  contactPhone: string
  settledAt: number
}

// Mock 用户
export interface MockUser {
  id: string
  role: Role
  account?: string
  password?: string
  phone?: string
  name: string
  enterpriseId?: string
}

// 动作类型
export type ActionType =
  | 'verify_accept'
  | 'verify_reject'
  | 'propose_suggestion'
  | 'committee_confirm'
  | 'consumer_agree'
  | 'consumer_disagree'
  | 'complete_reconcile'
  | 'return_visit'
  | 'evaluate'
  | 'view_detail'

export type ActionVariant = 'primary' | 'danger' | 'default'

export interface ActionDef {
  type: ActionType
  label: string
  variant: ActionVariant
  roles: Role[]
}
