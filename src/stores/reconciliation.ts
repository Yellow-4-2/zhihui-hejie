import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ReconciliationCase, Role, StatusTimelineItem } from '@/types'
import { CaseStatus } from '@/types'
import { MOCK_CASES } from '@/mock/cases'
import { genId, genCaseNo } from '@/utils/id'
import { useUserStore } from './user'

function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T
}

export const useReconciliationStore = defineStore(
  'reconciliation',
  () => {
    const cases = ref<ReconciliationCase[]>(clone(MOCK_CASES))

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

    function pushTimeline(c: ReconciliationCase, item: StatusTimelineItem) {
      c.timeline.push(item)
      c.updatedAt = item.at
    }

    function nextSeq(): number {
      let max = 0
      for (const c of cases.value) {
        const m = /(\d+)$/.exec(c.caseNo)
        if (m) max = Math.max(max, parseInt(m[1], 10))
      }
      return max + 1
    }

    // 发起和解
    function initiateCase(payload: {
      consumerName: string
      consumerPhone: string
      enterpriseName?: string
      commodity: string
      amount: number
      description: string
      initiator: Role
    }): ReconciliationCase {
      const now = Date.now()
      const userStore = useUserStore()
      const c: ReconciliationCase = {
        id: genId('c'),
        caseNo: genCaseNo(nextSeq()),
        status: CaseStatus.PENDING,
        consumerName: payload.consumerName,
        consumerPhone: payload.consumerPhone,
        enterpriseName: payload.enterpriseName,
        commodity: payload.commodity,
        amount: payload.amount,
        description: payload.description,
        initiator: payload.initiator,
        createdAt: now,
        updatedAt: now,
        timeline: [
          {
            status: CaseStatus.PENDING,
            at: now,
            operator: userStore.name || '用户',
            remark: '发起和解申请',
          },
        ],
      }
      cases.value.unshift(c)
      return c
    }

    // 受理并分配企业
    function acceptCase(id: string, enterpriseId: string, enterpriseName: string) {
      const c = getById(id)
      if (!c || c.status !== CaseStatus.PENDING) return false
      c.enterpriseId = enterpriseId
      c.enterpriseName = enterpriseName
      c.status = CaseStatus.ACCEPTED
      pushTimeline(c, {
        status: CaseStatus.ACCEPTED,
        at: Date.now(),
        operator: '消保委',
        remark: `核实情况属实，受理并分配至${enterpriseName}`,
      })
      return true
    }

    // 不受理
    function rejectCase(id: string, remark: string) {
      const c = getById(id)
      if (!c || c.status !== CaseStatus.PENDING) return false
      c.status = CaseStatus.REJECTED
      c.rejectRemark = remark
      pushTimeline(c, {
        status: CaseStatus.REJECTED,
        at: Date.now(),
        operator: '消保委',
        remark: remark || '不予受理',
      })
      return true
    }

    // 发起和解建议
    function proposeSuggestion(id: string, content: string, referencedCaseIds: string[]) {
      const c = getById(id)
      if (!c || c.status !== CaseStatus.ACCEPTED) return false
      c.suggestion = {
        content,
        referencedCaseIds,
        createdAt: Date.now(),
        author: '消保委',
      }
      c.status = CaseStatus.IN_PROGRESS
      pushTimeline(c, {
        status: CaseStatus.IN_PROGRESS,
        at: Date.now(),
        operator: '消保委',
        remark: '发起和解建议' + (referencedCaseIds.length ? '，并引用案例库参考' : ''),
      })
      return true
    }

    // 消费者确认（同意/不同意）
    function consumerConfirm(id: string, agreed: boolean) {
      const c = getById(id)
      if (!c || c.status !== CaseStatus.IN_PROGRESS) return false
      c.status = agreed ? CaseStatus.COMPLETED : CaseStatus.FAILED
      pushTimeline(c, {
        status: c.status,
        at: Date.now(),
        operator: '消费者',
        remark: agreed ? '同意和解方案' : '不同意和解方案',
      })
      return true
    }

    // 消保委和解确认（记录消费者决定）
    function committeeConfirm(id: string, agreed: boolean) {
      const c = getById(id)
      if (!c || c.status !== CaseStatus.IN_PROGRESS) return false
      c.status = agreed ? CaseStatus.COMPLETED : CaseStatus.FAILED
      pushTimeline(c, {
        status: c.status,
        at: Date.now(),
        operator: '消保委',
        remark: agreed ? '消费者确认同意，和解完成' : '消费者不同意，和解失败',
      })
      return true
    }

    // 企业完成和解（上传凭证）
    function completeReconcile(id: string, voucherImages: string[]) {
      const c = getById(id)
      if (!c || c.status !== CaseStatus.IN_PROGRESS) return false
      c.completionVoucherImages = voucherImages
      c.status = CaseStatus.COMPLETED
      pushTimeline(c, {
        status: CaseStatus.COMPLETED,
        at: Date.now(),
        operator: '入驻企业',
        remark: '与消费者达成一致，完成和解并上传凭证',
      })
      return true
    }

    // 回访确认
    function returnVisit(id: string, remark: string) {
      const c = getById(id)
      if (!c || c.status !== CaseStatus.COMPLETED) return false
      c.status = CaseStatus.FINISHED
      c.returnVisitRemark = remark
      c.returnVisitedAt = Date.now()
      pushTimeline(c, {
        status: CaseStatus.FINISHED,
        at: Date.now(),
        operator: '消保委',
        remark: `回访确认：${remark}`,
      })
      return true
    }

    // 评价
    function evaluate(id: string, rating: 1 | 2 | 3 | 4 | 5, comment?: string) {
      const c = getById(id)
      if (!c || c.status !== CaseStatus.FINISHED) return false
      c.evaluation = { rating, comment, createdAt: Date.now() }
      c.status = CaseStatus.EVALUATED
      pushTimeline(c, {
        status: CaseStatus.EVALUATED,
        at: Date.now(),
        operator: '消费者',
        remark: `评价满意（${rating}星）`,
      })
      return true
    }

    function resetMock() {
      cases.value = clone(MOCK_CASES)
    }

    return {
      cases,
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
  },
  {
    persist: {
      key: 'zhj-cases',
      pick: ['cases'],
    },
  },
)
