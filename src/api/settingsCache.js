import { settingsApi } from './index.js'

let cachedSettings = null
let settingsRequest = null

export function getSettings() {
  if (!settingsRequest) {
    settingsRequest = settingsApi
      .get()
      .then((data) => {
        cachedSettings = data
        return data
      })
      .catch(() => {
        settingsRequest = null
        return null
      })
  }
  return settingsRequest
}

export function getCachedSettings() {
  return cachedSettings
}
