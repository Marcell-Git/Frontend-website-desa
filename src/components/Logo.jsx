import { useEffect, useState } from 'react'
import { settingsApi } from '../api/index.js'
import { assetUrl } from '../api/config.js'

let cachedSettings = null
let settingsRequest = null

function fetchSettings() {
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

export default function Logo({
  settings,
  className = 'h-10 w-10 rounded-xl',
}) {
  const [fetched, setFetched] = useState(cachedSettings)

  useEffect(() => {
    if (settings || cachedSettings) return undefined
    let active = true
    fetchSettings().then((data) => {
      if (active && data) setFetched(data)
    })
    return () => {
      active = false
    }
  }, [settings])

  const logoPath = (settings ?? fetched)?.logo_path

  if (logoPath) {
    return (
      <img
        src={assetUrl(logoPath)}
        alt="Logo"
        className={`${className} object-contain`}
      />
    )
  }

  return (
    <div
      className={`${className} flex shrink-0 items-center justify-center bg-emerald-600 font-display text-base font-bold text-white`}
    >
      RT
    </div>
  )
}
