import { createContext, useContext, useEffect, useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { settingsApi } from '../api/index.js'
import Logo from './Logo.jsx'

const PublicSettingsContext = createContext(null)

export function usePublicSettings() {
  return useContext(PublicSettingsContext) ?? {
    settings: null,
    showPengumuman: true,
    showLaporan: true,
    showPengaduan: true,
    showVisiMisi: true,
  }
}

const NAV_ITEMS = [
  { to: '/', label: 'Beranda', end: true, show: () => true },
  { to: '/pengumuman', label: 'Pengumuman', show: (s) => s.show_pengumuman },
  { to: '/berita-kegiatan', label: 'Berita & Kegiatan', show: () => true },
  { to: '/laporan', label: 'Laporan', show: (s) => s.show_laporan },
  { to: '/pengaduan', label: 'Pengaduan', show: (s) => s.show_pengaduan },
  { to: '/visi-misi', label: 'Visi & Misi', show: (s) => s.show_visi_misi },
  { to: '/kontak', label: 'Kontak', show: () => true },
]

export default function PublicLayout() {
  const [settings, setSettings] = useState(null)
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const visibleItems = NAV_ITEMS.filter(
    (item) => !settings || item.show(settings),
  )

  return (
    <PublicSettingsContext.Provider value={{ settings }}>
      <div className="flex min-h-screen flex-col">
        <a
          href="#konten-utama"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-emerald-700 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
        >
          Langsung ke konten
        </a>

        <header
          className={`sticky top-0 z-40 border-b bg-white/95 backdrop-blur transition-all duration-300 ${
            scrolled
              ? 'border-slate-200 shadow-[0_8px_24px_-16px_rgba(6,78,59,0.25)]'
              : 'border-transparent'
          }`}
        >
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
            <Link to="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
              <Logo settings={settings} />
              <div className="leading-tight">
                <div className="font-display text-sm font-bold text-slate-900 sm:text-base">
                  {settings?.nama_website || 'Website RT'}
                </div>
                <div className="text-xs font-medium text-emerald-700">
                  {settings ? [settings.desa, settings.kecamatan].filter(Boolean).join(', ') : ''}
                </div>
              </div>
            </Link>

            <nav className="hidden items-center gap-1 md:flex" aria-label="Navigasi utama">
              {visibleItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `rounded-lg px-3 py-2 text-sm transition-colors ${
                      isActive
                        ? 'bg-emerald-50 font-semibold text-emerald-700'
                        : 'font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <button
              type="button"
              className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 md:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? 'Tutup menu' : 'Buka menu'}
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
            <nav className="animate-fade-in border-t border-slate-100 bg-white px-4 pb-4 pt-2 md:hidden" aria-label="Navigasi utama">
              {visibleItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `block rounded-lg px-3 py-2.5 text-sm ${
                      isActive
                        ? 'bg-emerald-50 font-semibold text-emerald-700'
                        : 'font-medium text-slate-600 hover:bg-slate-50'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          )}
        </header>

        <main id="konten-utama" className="flex-1">
          <Outlet />
        </main>

        <footer className="bg-emerald-900 text-emerald-100">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr] lg:gap-8">
            <div>
              <div className="flex items-center gap-3">
                <Logo settings={settings} />
                <div className="font-display text-base font-bold text-white">
                  {settings?.nama_website || 'Website RT'}
                </div>
              </div>
              {settings?.alamat && (
                <p className="mt-4 max-w-sm text-sm leading-relaxed text-emerald-200/90">{settings.alamat}</p>
              )}
            </div>

            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-emerald-300">Kontak</div>
              <ul className="mt-4 space-y-2.5 text-sm">
                {settings?.telepon && (
                  <li className="flex items-start gap-2.5">
                    <svg className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="text-emerald-100/90">{settings.telepon}</span>
                  </li>
                )}
                {settings?.email && (
                  <li className="flex items-start gap-2.5">
                    <svg className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="break-words text-emerald-100/90">{settings.email}</span>
                  </li>
                )}
                {!settings?.telepon && !settings?.email && <li className="text-emerald-200/60">-</li>}
              </ul>
            </div>

            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-emerald-300">Menu</div>
              <ul className="mt-4 space-y-2.5 text-sm">
                {visibleItems.map((item) => (
                  <li key={item.to}>
                    <Link to={item.to} className="text-emerald-100/90 underline-offset-4 transition-colors hover:text-white hover:underline">
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
            </div>
          </div>
        </footer>
      </div>
    </PublicSettingsContext.Provider>
  )
}
