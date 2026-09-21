import { http } from './http'
import type { User } from './users'

export interface LoginPayload {
  email: string
  password: string
}

export interface LoginResult {
  accessToken: string
  user: User
}

/** 登录：换取 JWT */
export function login(payload: LoginPayload): Promise<LoginResult> {
  return http<LoginResult>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

/** 获取当前登录用户信息 */
export function fetchProfile(): Promise<User> {
  return http<User>('/api/auth/profile')
}
