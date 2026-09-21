import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { MockUser } from '@/types'
import { Role } from '@/types'
import { MOCK_USERS } from '@/mock/users'
import { SMS_MOCK_CODE } from '@/config/constants'

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

    function loginPc(account: string, password: string): boolean {
      return loginByAccount(Role.COMMITTEE_PC, account, password)
    }

    // 通用账号密码登录：按指定角色匹配（消保委PC/消保委移动端均用账号密码）
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
