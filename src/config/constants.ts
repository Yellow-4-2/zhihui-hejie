import { Role } from '@/types'

export const ROLE_LABEL: Record<Role, string> = {
  [Role.COMMITTEE_PC]: '消保委（PC端）',
  [Role.COMMITTEE_M]: '消保委（移动端）',
  [Role.CONSUMER]: '消费者',
  [Role.ENTERPRISE]: '入驻企业',
}

export const ROLE_SHORT: Record<Role, string> = {
  [Role.COMMITTEE_PC]: '消保委',
  [Role.COMMITTEE_M]: '消保委',
  [Role.CONSUMER]: '消费者',
  [Role.ENTERPRISE]: '入驻企业',
}

// 移动端路由 :role 参数
export const MOBILE_ROLE_PARAM: Record<Role, string> = {
  [Role.COMMITTEE_PC]: 'committee',
  [Role.COMMITTEE_M]: 'committee',
  [Role.CONSUMER]: 'consumer',
  [Role.ENTERPRISE]: 'enterprise',
}

// 演示登录提示凭据
export interface DemoCredential {
  account?: string
  password?: string
  phone?: string
  code?: string
}
export const DEMO_CREDENTIALS: Record<Role, DemoCredential> = {
  [Role.COMMITTEE_PC]: { account: 'admin', password: '123456' },
  [Role.COMMITTEE_M]: { account: 'cmobile', password: '123456' },
  [Role.CONSUMER]: { phone: '13800000001', code: '123456' },
  [Role.ENTERPRISE]: { phone: '13900000001', code: '123456' },
}

export const SMS_MOCK_CODE = '123456'
