// 统一请求封装：自动携带 JWT、解析错误、401 时清除登录态并跳回登录页
// 纯前端模式：所有 /api 请求由本地 mock 数据层响应（localStorage 持久化），
// 无需后端即可完整增删改查；需要连真实后端时把 USE_MOCK_API 改为 false
import { handleMockRequest, MockHttpError } from './mock-server'

const USE_MOCK_API = true

const TOKEN_KEY = 'demo_token'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

export async function http<T>(url: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers)
  headers.set('Content-Type', 'application/json')

  const token = getToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)

  // 纯前端模式：直接路由到本地 mock 数据层，错误与 401 语义和真实后端保持一致
  if (USE_MOCK_API) {
    try {
      const payload = typeof options.body === 'string' ? JSON.parse(options.body) : options.body ?? null
      return handleMockRequest((options.method ?? 'GET').toUpperCase(), url, payload, headers.get('Authorization')) as T
    } catch (e) {
      if (e instanceof MockHttpError) {
        if (e.status === 401 && !url.includes('/api/auth/login')) {
          clearToken()
          if (!location.hash.startsWith('#/demo')) {
            location.hash = '#/demo'
          }
        }
        throw new Error(e.message)
      }
      throw e
    }
  }

  const res = await fetch(url, { ...options, headers })

  // 登录失效：清 token，回到 Demo 登录页（项目使用 hash 路由）
  // 登录接口本身的 401（密码错误）不算会话失效，交给调用方提示
  if (res.status === 401 && !url.includes('/api/auth/login')) {
    clearToken()
    if (!location.hash.startsWith('#/demo')) {
      location.hash = '#/demo'
    }
  }

  if (!res.ok) {
    let message = `请求失败（${res.status}）`
    try {
      const data = await res.json()
      if (data) {
        message = Array.isArray(data.message)
          ? data.message.join('；')
          : data.message || message
      }
    } catch {
      /* 非 JSON 错误响应保留默认提示 */
    }
    throw new Error(message)
  }

  return (await res.json().catch(() => null)) as T
}
