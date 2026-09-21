import { CaseStatus, Role, type ActionDef } from '@/types'

// 状态-动作矩阵：单一数据源，驱动各角色各状态的按钮
export const STATUS_ACTION_MATRIX: Record<CaseStatus, ActionDef[]> = {
  [CaseStatus.PENDING]: [
    { type: 'verify_accept', label: '核实受理', variant: 'primary', roles: [Role.COMMITTEE_PC, Role.COMMITTEE_M] },
    { type: 'verify_reject', label: '不受理', variant: 'danger', roles: [Role.COMMITTEE_PC, Role.COMMITTEE_M] },
    { type: 'view_detail', label: '查看', variant: 'default', roles: [Role.CONSUMER, Role.ENTERPRISE] },
  ],
  [CaseStatus.ACCEPTED]: [
    { type: 'propose_suggestion', label: '发起和解建议', variant: 'primary', roles: [Role.COMMITTEE_PC, Role.COMMITTEE_M] },
    { type: 'view_detail', label: '查看', variant: 'default', roles: [Role.CONSUMER, Role.ENTERPRISE] },
  ],
  [CaseStatus.IN_PROGRESS]: [
    { type: 'committee_confirm', label: '和解确认', variant: 'primary', roles: [Role.COMMITTEE_PC, Role.COMMITTEE_M] },
    { type: 'consumer_agree', label: '同意和解', variant: 'primary', roles: [Role.CONSUMER] },
    { type: 'consumer_disagree', label: '不同意', variant: 'danger', roles: [Role.CONSUMER] },
    { type: 'complete_reconcile', label: '完成和解', variant: 'primary', roles: [Role.ENTERPRISE] },
  ],
  [CaseStatus.COMPLETED]: [
    { type: 'return_visit', label: '回访确认', variant: 'primary', roles: [Role.COMMITTEE_PC, Role.COMMITTEE_M] },
    { type: 'view_detail', label: '查看', variant: 'default', roles: [Role.CONSUMER, Role.ENTERPRISE] },
  ],
  [CaseStatus.FAILED]: [
    { type: 'view_detail', label: '查看详情', variant: 'default', roles: Object.values(Role) },
  ],
  [CaseStatus.REJECTED]: [
    { type: 'view_detail', label: '查看详情', variant: 'default', roles: Object.values(Role) },
  ],
  [CaseStatus.FINISHED]: [
    { type: 'evaluate', label: '评价', variant: 'primary', roles: [Role.CONSUMER] },
    { type: 'view_detail', label: '查看详情', variant: 'default', roles: [Role.COMMITTEE_PC, Role.COMMITTEE_M, Role.ENTERPRISE] },
  ],
  [CaseStatus.EVALUATED]: [
    { type: 'view_detail', label: '查看详情', variant: 'default', roles: Object.values(Role) },
  ],
}
