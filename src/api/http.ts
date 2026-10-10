// 统一请求封装：自动携带 JWT、解析错误、401 时清除登录态并跳回登录页

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
