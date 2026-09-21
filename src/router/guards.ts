import type { Router } from 'vue-router'
import { Role } from '@/types'
import { useUserStore } from '@/stores/user'

const MOBILE_PARAM_TO_ROLE: Record<string, Role> = {
  committee: Role.COMMITTEE_M,
  consumer: Role.CONSUMER,
  enterprise: Role.ENTERPRISE,
}

export function setupGuards(router: Router) {
  router.beforeEach((to) => {
    const userStore = useUserStore()

    // 公开路由
    if (to.path === '/' || to.path.startsWith('/login')) {
      return true
    }

    // PC 端：仅消保委PC
    if (to.path.startsWith('/pc')) {
      if (userStore.role !== Role.COMMITTEE_PC) {
        return { path: '/login/pc' }
      }
      return true
    }

    // 移动端：校验角色与登录
    if (to.path.startsWith('/m/')) {
      const roleParam = to.params.role as string | undefined
      const expectedRoleParam = roleParam ?? 'consumer'
      const expectedRole = MOBILE_PARAM_TO_ROLE[expectedRoleParam]
      if (!expectedRole) {
        return { path: '/' }
      }
      if (userStore.role !== expectedRole) {
        return { path: `/login/m/${expectedRoleParam}` }
      }
      return true
    }

    return true
  })
}
