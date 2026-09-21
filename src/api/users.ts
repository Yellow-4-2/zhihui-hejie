// 用户管理接口 —— 对应 NestJS 的 /api/users（全部需要登录，token 由 http 层自动携带）
import { http } from './http'
import { Role } from '@/types'

/** 用户结构（password 不会返回） */
export interface User {
  id: number
  name: string
  email: string
  role: Role
  enterpriseId?: string
}

export interface CreateUserPayload {
  name: string
  email: string
  password: string
  role: Role
  enterpriseId?: string
}

export type UpdateUserPayload = Partial<CreateUserPayload>

const BASE_URL = '/api/users'

/** 获取用户列表，可按姓名/邮箱关键词搜索 */
export function fetchUsers(keyword = ''): Promise<User[]> {
  const query = keyword ? `?keyword=${encodeURIComponent(keyword)}` : ''
  return http<User[]>(`${BASE_URL}${query}`)
}

/** 获取单个用户 */
export function fetchUserById(id: number): Promise<User> {
  return http<User>(`${BASE_URL}/${id}`)
}

/** 创建用户 */
export function createUser(payload: CreateUserPayload): Promise<User> {
  return http<User>(BASE_URL, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

/** 更新用户 */
export function updateUser(id: number, payload: UpdateUserPayload): Promise<User> {
  return http<User>(`${BASE_URL}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

/** 删除用户 */
export function deleteUser(id: number): Promise<{ id: number }> {
  return http<{ id: number }>(`${BASE_URL}/${id}`, { method: 'DELETE' })
}
