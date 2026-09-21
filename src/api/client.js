import axios from 'axios'
import { API_BASE } from './config.js'

const client = axios.create({
  baseURL: `${API_BASE}/api/v1`,
  timeout: 20000,
})

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

const PUBLIC_PATHS = ['/', '/pengumuman', '/laporan', '/pengaduan', '/kontak', '/inventaris']

function isPublicPath(pathname) {
  return PUBLIC_PATHS.some((p) =>
    p === '/' ? pathname === '/' : pathname.startsWith(p),
  )
}

function clearSession() {
  localStorage.removeItem('token')
  localStorage.removeItem('refresh_token')
}

let refreshPromise = null

function refreshTokens() {
  const refreshToken = localStorage.getItem('refresh_token')
  if (!refreshToken) {
    return Promise.reject(new Error('Tidak ada refresh token'))
  }
  return axios
    .post(`${API_BASE}/api/v1/auth/refresh`, { refresh_token: refreshToken })
    .then((res) => {
      const data = res.data?.data
      if (!data?.token || !data?.refresh_token) {
        throw new Error('Respons refresh tidak valid')
      }
      localStorage.setItem('token', data.token)
      localStorage.setItem('refresh_token', data.refresh_token)
      return data.token
    })
}

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config
    const url = config?.url || ''
    const status = error.response?.status

    if (status === 401 && url.includes('/auth/login')) {
      return Promise.reject(error)
    }

    if (
      status === 401 &&
      !url.includes('/auth/refresh') &&
      !config?._retried &&
      localStorage.getItem('refresh_token')
    ) {
      config._retried = true
      try {
        refreshPromise = refreshPromise || refreshTokens()
        const token = await refreshPromise
        refreshPromise = null
        config.headers.Authorization = `Bearer ${token}`
        return client(config)
      } catch {
        refreshPromise = null
        clearSession()
        if (!isPublicPath(window.location.pathname)) {
          window.location.href = '/login'
        }
      }
    } else if (status === 401 && url.includes('/auth/refresh')) {
      clearSession()
      if (!isPublicPath(window.location.pathname)) {
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  },
)

export function errorMessage(err) {
  if (err.response && err.response.data) {
    return err.response.data.message || 'Terjadi kesalahan'
  }
  return err.message || 'Terjadi kesalahan'
}

export function fieldErrors(err) {
  if (err.response && err.response.data && err.response.data.errors) {
    return err.response.data.errors
  }
  return {}
}

export default client
