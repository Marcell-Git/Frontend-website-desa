import { createContext, useContext, useEffect, useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { settingsApi } from '../api/index.js'

const PublicSettingsContext = createContext(null)

export function usePublicSettings() {
  return useContext(PublicSettingsContext) ?? {
    settings: null,
    showPengumuman: true,
    showLaporan: true,
    showPengaduan: true,
  }
}

const NAV_ITEMS = [
  { to: '/', label: 'Beranda', end: true, show: () => true },
  { to: '/pengumuman', label: 'Pengumuman', show: (s) => s.show_pengumuman },
  { to: '/laporan', label: 'Laporan', show: (s) => s.show_laporan },
  { to: '/pengaduan', label: 'Pengaduan', show: (s) => s.show_pengaduan },
  { to: '/kontak', label: 'Kontak', show: () => true },
]

function Logo({ settings }) {
  if (settings?.logo_path) {
    return (
      <img
        src={`/${settings.logo_path}`}
        alt="Logo"
        className="h-10 w-10 rounded-lg object-contain"
      />
    )
  }
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-lg font-bold text-white">
      RT
    </div>
  )
}

export default function PublicLayout() {
  const [settings, setSettings] = useState(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    let active = true
    settingsApi
      .get()
      .then((data) => {
        if (active) setSettings(data)
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [])

  const visibleItems = NAV_ITEMS.filter(
    (item) => !settings || item.show(settings),
  )

  return (
    <PublicSettingsContext.Provider value={{ settings }}>
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <Link to="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
              <Logo settings={settings} />
              <div className="leading-tight">
                <div className="text-sm font-semibold text-slate-900 sm:text-base">
                  {settings?.nama_website || 'Website RT'}
                </div>
                <div className="text-xs text-emerald-700">
                  {settings ? [settings.desa, settings.kecamatan].filter(Boolean).join(', ') : ''}
                </div>
              </div>
            </Link>

            <nav className="hidden items-center gap-1 md:flex">
              {visibleItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <button
              type="button"
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-label="Buka menu"
              aria-expanded={open}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                {open ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {open && (
            <nav className="border-t border-slate-200 bg-white px-4 pb-3 pt-2 md:hidden">
              {visibleItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `block rounded-lg px-3 py-2.5 text-sm font-medium ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          )}
        </header>

        <main className="flex-1">
          <Outlet />
        </main>

        <footer className="bg-emerald-900 text-emerald-100">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <div className="flex items-center gap-3">
                <Logo settings={settings} />
                <div className="font-semibold text-white">
                  {settings?.nama_website || 'Website RT'}
                </div>
              </div>
              {settings?.alamat && (
                <p className="mt-3 text-sm leading-relaxed text-emerald-200">{settings.alamat}</p>
              )}
            </div>

            <div>
              <div className="text-sm font-semibold uppercase tracking-wider text-emerald-400">Kontak</div>
              <ul className="mt-3 space-y-2 text-sm text-emerald-100">
                {settings?.telepon && <li>Telepon: {settings.telepon}</li>}
                {settings?.email && <li>Email: {settings.email}</li>}
                {!settings?.telepon && !settings?.email && <li>-</li>}
              </ul>
            </div>

            <div>
              <div className="text-sm font-semibold uppercase tracking-wider text-emerald-400">Menu</div>
              <ul className="mt-3 space-y-2 text-sm">
                {visibleItems.map((item) => (
                  <li key={item.to}>
                    <Link to={item.to} className="text-emerald-100 hover:text-white hover:underline">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-emerald-800">
            <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-emerald-300 sm:flex-row">
              <span>{settings?.copyright || `© ${new Date().getFullYear()} ${settings?.nama_website || 'RT'}`}</span>
              <Link to="/login" className="hover:text-white hover:underline">
                Login Pengurus
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </PublicSettingsContext.Provider>
  )
}
