import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { MockUser } from '@/types'
import { Role } from '@/types'
import { MOCK_USERS } from '@/mock/users'
import { SMS_MOCK_CODE } from '@/config/constants'
import { login as authLogin } from '@/api/auth'
import { setToken } from '@/api/http'

/** 历史演示账号 → 后端预置邮箱映射（登录框仍可预填 admin） */
const PC_ACCOUNT_EMAIL_MAP: Record<string, string> = {
  admin: 'committee-pc@test.com',
}

export const useUserStore = defineStore(
  'user',
  () => {
    const currentUser = ref<MockUser | null>(null)

    const role = computed<Role | null>(() => currentUser.value?.role ?? null)
    const isLoggedIn = computed(() => !!currentUser.value)
    const isCommitteePc = computed(() => currentUser.value?.role === Role.COMMITTEE_PC)
    const isCommitteeM = computed(() => currentUser.value?.role === Role.COMMITTEE_M)
    const isConsumer = computed(() => currentUser.value?.role === Role.CONSUMER)
    const isEnterprise = computed(() => currentUser.value?.role === Role.ENTERPRISE)
    const isCommittee = computed(
      () => isCommitteePc.value || isCommitteeM.value,
    )
    const layout = computed<'pc' | 'm' | null>(() =>
      currentUser.value?.role === Role.COMMITTEE_PC ? 'pc' : currentUser.value ? 'm' : null,
    )
    const enterpriseId = computed(() => currentUser.value?.enterpriseId)
    const phone = computed(() => currentUser.value?.phone)
    const name = computed(() => currentUser.value?.name ?? '')

    /** PC 端登录：走真实后端 /api/auth/login 换取 JWT，供 /api/users 等鉴权接口使用；失败时抛出错误信息 */
    async function loginPc(account: string, password: string): Promise<void> {
      const email = PC_ACCOUNT_EMAIL_MAP[account.trim()] ?? account.trim()
      const res = await authLogin({ email, password })
      setToken(res.accessToken)
      currentUser.value = {
        id: `u-${res.user.id}`,
        role: res.user.role,
        name: res.user.name,
        account: res.user.email,
        enterpriseId: res.user.enterpriseId ?? undefined,
      }
    }

    // 通用账号密码登录：按指定角色匹配（消保委移动端沿用演示账号）
    function loginByAccount(targetRole: Role, account: string, password: string): boolean {
      const u = MOCK_USERS.find(
        (x) => x.role === targetRole && x.account === account && x.password === password,
      )
      if (!u) return false
      currentUser.value = { ...u }
      return true
    }

    function loginMobile(targetRole: Role, account: string, code: string): boolean {
      if (code !== SMS_MOCK_CODE) return false
      const byAccount = (x: MockUser) => x.role === targetRole && x.account === account
      const byPhone = (x: MockUser) => x.role === targetRole && x.phone === account
      const u = MOCK_USERS.find(byAccount) ?? MOCK_USERS.find(byPhone)
      if (!u) return false
      currentUser.value = { ...u }
      return true
    }

    function logout() {
      currentUser.value = null
    }

    return {
      currentUser,
      role,
      isLoggedIn,
      isCommitteePc,
      isCommitteeM,
      isConsumer,
      isEnterprise,
      isCommittee,
      layout,
      enterpriseId,
      phone,
      name,
      loginPc,
      loginByAccount,
      loginMobile,
      logout,
    }
  },
  {
    persist: {
      key: 'zhj-user',
      pick: ['currentUser'],
    },
  },
)
