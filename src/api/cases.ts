import { http } from './http'
import type { ReconciliationCase, Role } from '@/types'

const BASE_URL = '/api/cases'

/** 获取案件列表（可按状态筛选） */
export function fetchCases(status?: string): Promise<ReconciliationCase[]> {
  const query = status ? `?status=${encodeURIComponent(status)}` : ''
  return http<ReconciliationCase[]>(`${BASE_URL}${query}`)
}

/** 获取单个案件详情 */
export function fetchCaseById(id: string): Promise<ReconciliationCase> {
  return http<ReconciliationCase>(`${BASE_URL}/${id}`)
}

/** 发起和解申请 */
export function createCase(payload: {
  consumerName: string
  consumerPhone: string
  enterpriseName?: string
  commodity: string
  amount: number
  description: string
  initiator: Role
}): Promise<ReconciliationCase> {
  return http<ReconciliationCase>(BASE_URL, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

/** 受理并分配企业 */
export function acceptCase(id: string, enterpriseId: string, enterpriseName: string): Promise<ReconciliationCase> {
  return http<ReconciliationCase>(`${BASE_URL}/${id}/accept`, {
    method: 'POST',
    body: JSON.stringify({ enterpriseId, enterpriseName }),
  })
}

/** 不受理 */
export function rejectCase(id: string, remark: string): Promise<ReconciliationCase> {
  return http<ReconciliationCase>(`${BASE_URL}/${id}/reject`, {
    method: 'POST',
    body: JSON.stringify({ remark }),
  })
}

/** 发起和解建议 */
export function proposeSuggestion(id: string, content: string, referencedCaseIds: string[]): Promise<ReconciliationCase> {
  return http<ReconciliationCase>(`${BASE_URL}/${id}/propose`, {
    method: 'POST',
    body: JSON.stringify({ content, referencedCaseIds }),
  })
}

/** 消费者确认 */
export function consumerConfirm(id: string, agreed: boolean): Promise<ReconciliationCase> {
  return http<ReconciliationCase>(`${BASE_URL}/${id}/consumer-confirm`, {
    method: 'POST',
    body: JSON.stringify({ agreed }),
  })
}

/** 消保委和解确认 */
export function committeeConfirm(id: string, agreed: boolean): Promise<ReconciliationCase> {
  return http<ReconciliationCase>(`${BASE_URL}/${id}/committee-confirm`, {
    method: 'POST',
    body: JSON.stringify({ agreed }),
  })
}

/** 企业完成和解 */
export function completeReconcile(id: string, voucherImages: string[]): Promise<ReconciliationCase> {
  return http<ReconciliationCase>(`${BASE_URL}/${id}/complete`, {
    method: 'POST',
    body: JSON.stringify({ voucherImages }),
  })
}

/** 回访确认 */
export function returnVisit(id: string, remark: string): Promise<ReconciliationCase> {
  return http<ReconciliationCase>(`${BASE_URL}/${id}/return-visit`, {
    method: 'POST',
    body: JSON.stringify({ remark }),
  })
}

/** 评价 */
export function evaluateCase(id: string, rating: 1 | 2 | 3 | 4 | 5, comment?: string): Promise<ReconciliationCase> {
  return http<ReconciliationCase>(`${BASE_URL}/${id}/evaluate`, {
    method: 'POST',
    body: JSON.stringify({ rating, comment }),
  })
}
