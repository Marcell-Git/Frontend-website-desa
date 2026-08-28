export const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

export function assetUrl(path) {
  if (!path) return path
  return `${API_BASE}/${path.replace(/^\/+/, '')}`
}