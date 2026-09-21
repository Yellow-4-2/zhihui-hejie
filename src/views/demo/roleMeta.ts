import { Role } from '@/types'

/** 角色中文文案与标签颜色（前后端 Demo 共用） */
export const ROLE_META: Record<Role, { label: string; color: string }> = {
  [Role.CONSUMER]: { label: '消费者', color: '#1989fa' },
  [Role.ENTERPRISE]: { label: '入驻企业', color: '#07c160' },
  [Role.COMMITTEE_M]: { label: '消保委(移动)', color: '#ff976a' },
  [Role.COMMITTEE_PC]: { label: '消保委(PC)', color: '#7232dd' },
}

export const roleLabel = (role: Role) => ROLE_META[role]?.label ?? role
