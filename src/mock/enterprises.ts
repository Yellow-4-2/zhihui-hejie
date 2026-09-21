import type { Enterprise } from '@/types'

export const MOCK_ENTERPRISES: Enterprise[] = [
  { id: 'e1', name: '海尔', category: '家电', contactPhone: '0571-88888001', settledAt: new Date('2021-06-15').getTime() },
  { id: 'e2', name: '美的', category: '家电', contactPhone: '0571-88888002', settledAt: new Date('2021-08-20').getTime() },
  { id: 'e3', name: '苏宁易购', category: '零售', contactPhone: '0571-88888003', settledAt: new Date('2022-01-10').getTime() },
  { id: 'e4', name: '格力', category: '家电', contactPhone: '0571-88888004', settledAt: new Date('2022-03-05').getTime() },
]
