import { http } from './http'
import type { Enterprise } from '@/types'

/** 获取企业列表（可搜索） */
export function fetchEnterprises(keyword = ''): Promise<Enterprise[]> {
  const query = keyword ? `?keyword=${encodeURIComponent(keyword)}` : ''
  return http<Enterprise[]>(`/api/enterprises${query}`)
}

/** 获取单个企业 */
export function fetchEnterpriseById(id: string): Promise<Enterprise> {
  return http<Enterprise>(`/api/enterprises/${id}`)
}

/** 新增入驻企业 */
export function createEnterprise(data: Omit<Enterprise, 'id' | 'settledAt'>): Promise<Enterprise> {
  return http<Enterprise>('/api/enterprises', { method: 'POST', body: JSON.stringify(data) })
}
