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
