import type { MockUser } from '@/types'

export const MOCK_USERS: MockUser[] = [
  { id: 'u-cm1', role: 'committee_pc' as never, account: 'admin', password: '123456', name: '消保委管理员' },
  { id: 'u-cm2', role: 'committee_m' as never, account: 'cmobile', password: '123456', name: '消保委移动端' },
  { id: 'u-con1', role: 'consumer' as never, phone: '13800000001', name: '张三' },
  { id: 'u-con2', role: 'consumer' as never, phone: '13800000002', name: '李四' },
  { id: 'u-ent1', role: 'enterprise' as never, phone: '13900000001', name: '海尔客服', enterpriseId: 'e1' },
  { id: 'u-ent2', role: 'enterprise' as never, phone: '13900000002', name: '美的客服', enterpriseId: 'e2' },
]
