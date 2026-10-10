import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ReconciliationCase, Role } from '@/types'
import { CaseStatus } from '@/types'
import {
  fetchCases,
  createCase,
  acceptCase as apiAccept,
  rejectCase as apiReject,
  proposeSuggestion as apiPropose,
  consumerConfirm as apiConsumerConfirm,
  committeeConfirm as apiCommitteeConfirm,
  completeReconcile as apiComplete,
  returnVisit as apiReturnVisit,
  evaluateCase as apiEvaluate,
} from '@/api/cases'
import { useUserStore } from './user'

export const useReconciliationStore = defineStore('reconciliation', () => {
  const cases = ref<ReconciliationCase[]>([])
  const loaded = ref(false)

  async function init() {
    if (loaded.value) return
    try {
      cases.value = await fetchCases()
      loaded.value = true
    } catch (e) {
      console.error('fetch cases failed:', e)
    }
  }

  function getById(id: string): ReconciliationCase | undefined {
    return cases.value.find((c) => c.id === id)
  }

  // 按角色过滤可见案例
  function casesForRole(role: Role | null): ReconciliationCase[] {
    const userStore = useUserStore()
    if (role === null) return []
    if (role === 'committee_pc' || role === 'committee_m') {
      return [...cases.value].sort((a, b) => b.updatedAt - a.updatedAt)
    }
    if (role === 'consumer') {
      const phone = userStore.phone
      return cases.value
        .filter((c) => c.consumerPhone === phone)
        .sort((a, b) => b.updatedAt - a.updatedAt)
    }
    if (role === 'enterprise') {
      const eid = userStore.enterpriseId
      return cases.value
        .filter((c) => c.enterpriseId === eid)
        .sort((a, b) => b.updatedAt - a.updatedAt)
    }
    return []
  }

  function byStatus(status: CaseStatus | 'ALL', role: Role | null): ReconciliationCase[] {
    const list = casesForRole(role)
    if (status === 'ALL') return list
    return list.filter((c) => c.status === status)
  }

  function countsFor(role: Role | null): Record<string, number> {
    const list = casesForRole(role)
    const counts: Record<string, number> = {}
    for (const s of Object.values(CaseStatus)) counts[s] = 0
    for (const c of list) counts[c.status] = (counts[c.status] ?? 0) + 1
    counts['ALL'] = list.length
    return counts
  }

  // 用 API 返回的更新后案件替换本地数组中的同 id 案件
  function replaceCase(updated: ReconciliationCase) {
    const idx = cases.value.findIndex((c) => c.id === updated.id)
    if (idx >= 0) {
      cases.value[idx] = updated
    } else {
      cases.value.unshift(updated)
    }
  }

  // 发起和解
  async function initiateCase(payload: {
    consumerName: string
    consumerPhone: string
    enterpriseName?: string
    commodity: string
    amount: number
    description: string
    initiator: Role
  }): Promise<ReconciliationCase | null> {
    try {
      const created = await createCase(payload)
      cases.value.unshift(created)
      return created
    } catch (e) {
      console.error('initiateCase failed:', e)
      return null
    }
  }

  // 受理并分配企业
  async function acceptCase(id: string, enterpriseId: string, enterpriseName: string): Promise<boolean> {
    try {
      const updated = await apiAccept(id, enterpriseId, enterpriseName)
      replaceCase(updated)
      return true
    } catch (e) {
      console.error('acceptCase failed:', e)
      return false
    }
  }

  // 不受理
  async function rejectCase(id: string, remark: string): Promise<boolean> {
    try {
      const updated = await apiReject(id, remark)
      replaceCase(updated)
      return true
    } catch (e) {
      console.error('rejectCase failed:', e)
      return false
    }
  }

  // 发起和解建议
  async function proposeSuggestion(id: string, content: string, referencedCaseIds: string[]): Promise<boolean> {
    try {
      const updated = await apiPropose(id, content, referencedCaseIds)
      replaceCase(updated)
      return true
    } catch (e) {
      console.error('proposeSuggestion failed:', e)
      return false
    }
  }

  // 消费者确认（同意/不同意）
  async function consumerConfirm(id: string, agreed: boolean): Promise<boolean> {
    try {
      const updated = await apiConsumerConfirm(id, agreed)
      replaceCase(updated)
      return true
    } catch (e) {
      console.error('consumerConfirm failed:', e)
      return false
    }
  }

  // 消保委和解确认
  async function committeeConfirm(id: string, agreed: boolean): Promise<boolean> {
    try {
      const updated = await apiCommitteeConfirm(id, agreed)
      replaceCase(updated)
      return true
    } catch (e) {
      console.error('committeeConfirm failed:', e)
      return false
    }
  }

  // 企业完成和解（上传凭证）
  async function completeReconcile(id: string, voucherImages: string[]): Promise<boolean> {
    try {
      const updated = await apiComplete(id, voucherImages)
      replaceCase(updated)
      return true
    } catch (e) {
      console.error('completeReconcile failed:', e)
      return false
    }
  }

  // 回访确认
  async function returnVisit(id: string, remark: string): Promise<boolean> {
    try {
      const updated = await apiReturnVisit(id, remark)
      replaceCase(updated)
      return true
    } catch (e) {
      console.error('returnVisit failed:', e)
      return false
    }
  }

  // 评价
  async function evaluate(id: string, rating: 1 | 2 | 3 | 4 | 5, comment?: string): Promise<boolean> {
    try {
      const updated = await apiEvaluate(id, rating, comment)
      replaceCase(updated)
      return true
    } catch (e) {
      console.error('evaluate failed:', e)
      return false
    }
  }

  // 重新从后端拉取全部数据（原 resetMock）
  async function resetMock() {
    loaded.value = false
    await init()
  }

  return {
    cases,
    loaded,
    init,
    getById,
    casesForRole,
    byStatus,
    countsFor,
    initiateCase,
    acceptCase,
    rejectCase,
    proposeSuggestion,
    consumerConfirm,
    committeeConfirm,
    completeReconcile,
    returnVisit,
    evaluate,
    resetMock,
  }
})
