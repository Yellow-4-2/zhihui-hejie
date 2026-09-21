import { computed } from 'vue'
import type { ReconciliationCase, Role, ActionDef } from '@/types'
import { STATUS_ACTION_MATRIX } from '@/config/statusActionMatrix'

// 解析当前角色在某案例状态下可执行的动作
// 接受 getter 以保证响应式（案例对象在 store 中被原地变更）
export function useCaseActions(
  getCase: () => ReconciliationCase | undefined,
  role: Role | null,
) {
  const actions = computed<ActionDef[]>(() => {
    const c = getCase()
    if (!c || !role) return []
    const all = STATUS_ACTION_MATRIX[c.status] ?? []
    return all.filter((a) => a.roles.includes(role))
  })
  return { actions }
}
