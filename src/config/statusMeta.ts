import { CaseStatus } from '@/types'

export interface StatusMeta {
  label: string
  color: string
  order: number
}

export const STATUS_META: Record<CaseStatus, StatusMeta> = {
  [CaseStatus.PENDING]: { label: '待受理', color: '#ff976a', order: 1 },
  [CaseStatus.ACCEPTED]: { label: '已受理', color: '#1989fa', order: 2 },
  [CaseStatus.IN_PROGRESS]: { label: '和解中', color: '#7232dd', order: 3 },
  [CaseStatus.COMPLETED]: { label: '和解完成', color: '#07c160', order: 4 },
  [CaseStatus.FAILED]: { label: '和解失败', color: '#ee0a24', order: 5 },
  [CaseStatus.FINISHED]: { label: '已完结', color: '#969799', order: 6 },
  [CaseStatus.REJECTED]: { label: '不受理', color: '#909399', order: 7 },
  [CaseStatus.EVALUATED]: { label: '已评价', color: '#f5a623', order: 8 },
}

// 主流程顺序（用于首页统计 grid 排序）
export const STATUS_FLOW_ORDER: CaseStatus[] = [
  CaseStatus.PENDING,
  CaseStatus.ACCEPTED,
  CaseStatus.IN_PROGRESS,
  CaseStatus.COMPLETED,
  CaseStatus.FAILED,
  CaseStatus.FINISHED,
  CaseStatus.REJECTED,
  CaseStatus.EVALUATED,
]

// 各移动端角色首页展示的状态集合
export const HOME_STATUS_BY_ROLE: Record<string, CaseStatus[]> = {
  committee_m: [
    CaseStatus.PENDING,
    CaseStatus.ACCEPTED,
    CaseStatus.IN_PROGRESS,
    CaseStatus.COMPLETED,
    CaseStatus.FAILED,
    CaseStatus.FINISHED,
    CaseStatus.REJECTED,
    CaseStatus.EVALUATED,
  ],
  consumer: [
    CaseStatus.PENDING,
    CaseStatus.ACCEPTED,
    CaseStatus.IN_PROGRESS,
    CaseStatus.COMPLETED,
    CaseStatus.FINISHED,
    CaseStatus.EVALUATED,
    CaseStatus.REJECTED,
    CaseStatus.FAILED,
  ],
  enterprise: [
    CaseStatus.PENDING,
    CaseStatus.ACCEPTED,
    CaseStatus.IN_PROGRESS,
    CaseStatus.COMPLETED,
    CaseStatus.FAILED,
    CaseStatus.FINISHED,
    CaseStatus.REJECTED,
    CaseStatus.EVALUATED,
  ],
}
