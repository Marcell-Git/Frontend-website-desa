import { useEffect, useState } from 'react'
import { assetUrl } from '../api/config.js'
import { getCachedSettings, getSettings } from '../api/settingsCache.js'

export default function Logo({
  settings,
  className = 'h-10 w-10 rounded-xl',
}) {
  const [fetched, setFetched] = useState(getCachedSettings())

  useEffect(() => {
    if (settings || getCachedSettings()) return undefined
    let active = true
    getSettings().then((data) => {
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
