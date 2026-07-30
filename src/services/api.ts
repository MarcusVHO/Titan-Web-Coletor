const getRuntimeEnv = (key: string): string => {
  if (typeof window !== 'undefined' && (window as unknown as Record<string, Record<string, string>>).__ENV__) {
    const env = (window as unknown as Record<string, Record<string, string>>).__ENV__
    const val = env[key]
    if (typeof val === 'string' && val.trim() && !val.startsWith('$')) {
      return val.trim()
    }
  }
  return (import.meta.env[key] as string) ?? ''
}

const BASE_URL =
  getRuntimeEnv('VITE_API_URL') || getRuntimeEnv('VITE_API_BASE_URL')

const SUPPLY_BASE_URL =
  getRuntimeEnv('VITE_SUPPLY_API_URL') || getRuntimeEnv('VITE_SUPPLY_API_BASE_URL')

function buildUrl(path: string, overrideBaseUrl?: string) {
  const rawBase = overrideBaseUrl !== undefined ? overrideBaseUrl : BASE_URL
  const base = rawBase.replace(/\/+$/, '')
  if (!base) {
    throw new Error('URL do backend não configurada. Defina a variável VITE_API_URL na .env ou no container.')
  }
  const p = path.replace(/^\/+/, '')
  return `${base}/${p}`
}

export type ApiOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  headers?: Record<string, string>
  body?: unknown
  auth?: boolean
  baseUrl?: string
  timeoutMs?: number
}

export async function apiFetch<T = unknown>(
  path: string,
  options: ApiOptions = {},
): Promise<T> {
  const isForm =
    options.body instanceof FormData || options.body instanceof URLSearchParams
  const headers: Record<string, string> = {
    ...(options.headers ?? {}),
  }
  if (!isForm) {
    headers['Content-Type'] = headers['Content-Type'] ?? 'application/json'
  }

  if (options.auth) {
    const token = localStorage.getItem('auth_token')
    if (token) headers.Authorization = `Bearer ${token}`
  }

  let requestBody: BodyInit | undefined
  if (options.body !== undefined) {
    if (typeof options.body === 'string' || isForm) {
      requestBody = options.body as unknown as BodyInit
    } else {
      requestBody = JSON.stringify(options.body)
    }
  }

  const targetUrl = buildUrl(path, options.baseUrl)
  const timeoutMs = options.timeoutMs ?? 10000
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const res = await fetch(targetUrl, {
      method: options.method ?? 'GET',
      headers,
      body: requestBody,
      signal: controller.signal,
    })

    if (res.status === 401 && options.auth) {
      clearToken()
      window.location.href = '/'
      throw new Error('Sessão expirada. Faça login novamente.')
    }

    const text = await res.text()
    let data: unknown
    try {
      data = text ? JSON.parse(text) : undefined
    } catch {
      data = text
    }

    if (!res.ok) {
      let message = `Erro ${res.status}: ${res.statusText}`
      if (data && typeof data === 'object') {
        const d = data as Record<string, unknown>
        if (typeof d.message === 'string') message = d.message
        else if (typeof d.error === 'string') message = d.error
        else if (Array.isArray(d.detail)) {
          const details = (d.detail as unknown[])
            .map((it) => {
              if (it && typeof it === 'object') {
                const msg = (it as Record<string, unknown>).msg
                return typeof msg === 'string' ? msg : ''
              }
              return ''
            })
            .filter(Boolean)
            .join('; ')
          if (details) message = details
        } else if (typeof d.detail === 'string') {
          message = d.detail
        }
      } else if (typeof data === 'string' && data.trim()) {
        message = data
      }
      throw new Error(message)
    }
    return data as T
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('Tempo limite de resposta excedido (10s). Verifique a conexão com a API.')
    }
    if (
      err instanceof Error &&
      (err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))
    ) {
      throw new Error('Falha de conexão com a API. Verifique se o backend está online.')
    }
    throw err
  } finally {
    clearTimeout(timeoutId)
  }
}

export function setToken(token: string) {
  localStorage.setItem('auth_token', token)
}

export function clearToken() {
  localStorage.removeItem('auth_token')
}

export function supplyApiFetch<T = unknown>(
  path: string,
  options: ApiOptions = {},
): Promise<T> {
  return apiFetch<T>(path, {
    ...options,
    baseUrl: options.baseUrl ?? SUPPLY_BASE_URL,
  })
}
