import axios from 'axios'

const client = axios.create({
  baseURL: '/api/v1',
  timeout: 20000,
})

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('refresh_token')
      if (!window.location.pathname.startsWith('/login')) {
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
