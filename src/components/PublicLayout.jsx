import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { settingsApi } from '../api/index.js'
import { SOCIAL_LINKS } from '../lib/socialLinks.js'
import Logo from './Logo.jsx'

const PublicSettingsContext = createContext(null)

export function usePublicSettings() {
  return useContext(PublicSettingsContext) ?? {
    settings: null,
    showPengumuman: true,
    showLaporan: true,
    showPengaduan: true,
    showVisiMisi: true,
    showPeraturan: true,
    showStatistik: true,
  }
}

const NAV_GROUPS = [
  { to: '/', label: 'Beranda', end: true, show: () => true },
  {
    label: 'Informasi',
    items: [
      { to: '/pengumuman', label: 'Pengumuman', show: (s) => s.show_pengumuman },
      { to: '/berita-kegiatan', label: 'Berita & Kegiatan', show: () => true },
      { to: '/inventaris', label: 'Inventaris', show: () => true },
      { to: '/peraturan', label: 'Peraturan RT', show: (s) => s.show_peraturan },
      { to: '/pendataan-anak-kos', label: 'Pendataan Anak Kos/Warga Kontrak', show: () => true },
    ],
  },
  {
    label: 'Transparansi',
    items: [
      { to: '/laporan', label: 'Laporan', show: (s) => s.show_laporan },
      { to: '/statistik', label: 'Statistik Warga', show: (s) => s.show_statistik },
      { to: '/pengaduan', label: 'Pengaduan', show: (s) => s.show_pengaduan },
    ],
  },
  {
    label: 'Tentang',
    items: [
      { to: '/visi-misi', label: 'Visi & Misi', show: (s) => s.show_visi_misi },
      { to: '/pengurus', label: 'Pengurus RT', show: () => true },
      { to: '/kontak', label: 'Kontak', show: () => true },
    ],
  },
]

function NavDropdown({ label, items }) {
  const location = useLocation()
  const [isOpen, setOpen] = useState(false)
  const rootRef = useRef(null)

  const isActive = items.some(
    (item) => location.pathname === item.to || location.pathname.startsWith(`${item.to}/`),
  )

  useEffect(() => {
    if (!isOpen) return undefined
    const onPointerDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false)
    }
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [isOpen])

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className={`inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm transition-colors ${
          isActive || isOpen
            ? 'bg-emerald-50 font-semibold text-emerald-700'
            : 'font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        }`}
      >
        {label}
        <svg
          className={`h-3.5 w-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div
          role="menu"
          className="absolute left-0 top-full z-50 mt-1 min-w-52 animate-fade-in rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg shadow-emerald-900/10"
        >
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              role="menuitem"
              onClick={() => setOpen(false)}
              className={({ isActive: childActive }) =>
                `block rounded-lg px-3 py-2 text-sm transition-colors ${
                  childActive
                    ? 'bg-emerald-50 font-semibold text-emerald-700'
                    : 'font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  )
}

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

  const visibleGroups = NAV_GROUPS.map((group) =>
    group.items
      ? { ...group, items: group.items.filter((item) => !settings || item.show(settings)) }
      : group,
  ).filter((group) =>
    group.items ? group.items.length > 0 : !settings || group.show(settings),
  )

  const visibleItems = visibleGroups.flatMap((group) =>
    group.items ? group.items : [group],
  )

  const hasCoordinates =
    typeof settings?.maps_lat === 'number' && typeof settings?.maps_lng === 'number'
  const mapsQuery = hasCoordinates
    ? `${settings.maps_lat},${settings.maps_lng}`
    : [settings?.alamat, settings?.desa, settings?.kecamatan, settings?.kabupaten]
        .filter(Boolean)
        .join(', ')
  const mapsUrl = `https://www.google.com/maps?q=${encodeURIComponent(mapsQuery)}`
  const mapsEmbed = `${mapsUrl}&output=embed`
  const showMaps = hasCoordinates || Boolean(mapsQuery)

  const socialLinks = SOCIAL_LINKS.filter(({ key }) =>
    /^https?:\/\//i.test((settings?.[key] || '').trim()),
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
              {visibleGroups.map((group) =>
                group.items ? (
                  <NavDropdown key={group.label} label={group.label} items={group.items} />
                ) : (
                  <NavLink
                    key={group.to}
                    to={group.to}
                    end={group.end}
                    className={({ isActive }) =>
                      `rounded-lg px-3 py-2 text-sm transition-colors ${
                        isActive
                          ? 'bg-emerald-50 font-semibold text-emerald-700'
                          : 'font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`
                    }
                  >
                    {group.label}
                  </NavLink>
                ),
              )}
            </nav>

            <Link
              to="/login"
              className="hidden items-center gap-1.5 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-800 md:inline-flex"
            >
              Masuk
            </Link>

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
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="mt-2 block rounded-lg bg-emerald-700 px-3 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-emerald-800"
              >
                Masuk
              </Link>
            </nav>
          )}
        </header>

        <main id="konten-utama" className="flex-1">
          <Outlet />
        </main>

        <footer className="bg-emerald-900 text-emerald-100">
          <div className="h-1 bg-emerald-700" aria-hidden="true" />
          <div className="mx-auto grid max-w-6xl gap-12 px-4 py-14 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1.1fr] lg:gap-10">
            <div>
              <div className="flex items-center gap-3">
                <Logo settings={settings} />
                <div className="leading-tight">
                  <div className="font-display text-base font-bold text-white">
                    {settings?.nama_website || 'Website RT'}
                  </div>
                  <div className="text-xs font-medium text-emerald-300">
                    {settings ? [settings.desa, settings.kecamatan].filter(Boolean).join(', ') : ''}
                  </div>
                </div>
              </div>
              <p className="mt-5 max-w-sm text-sm leading-relaxed text-emerald-200/90">
                Media informasi resmi warga: pengumuman, transparansi laporan keuangan, dan sarana
                penyampaian pengaduan masyarakat.
              </p>
              {socialLinks.length > 0 && (
                <nav aria-label="Media sosial" className="mt-6 flex flex-wrap items-center gap-2.5">
                  {socialLinks.map(({ key, label, icon: Icon }) => (
                    <a
                      key={key}
                      href={settings[key].trim()}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={label}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-800 text-emerald-200 transition-colors hover:border-emerald-500 hover:bg-emerald-800 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300"
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                      <span className="sr-only">{label}</span>
                    </a>
                  ))}
                </nav>
              )}
            </div>

            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-emerald-300">Kontak</div>
              <ul className="mt-5 space-y-2.5 text-sm">
                {settings?.alamat && (
                  <li className="flex items-start gap-2.5">
                    <svg className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-emerald-100/90">{settings.alamat}</span>
                  </li>
                )}
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
                {!settings?.alamat && !settings?.telepon && !settings?.email && (
                  <li className="text-emerald-200/60">-</li>
                )}
              </ul>
            </div>

            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-emerald-300">Lokasi</div>
              {showMaps ? (
                <>
                  <div className="mt-5 overflow-hidden rounded-xl border border-emerald-800">
                    <iframe
                      title={`Peta lokasi ${settings?.nama_website || 'RT'}`}
                      src={mapsEmbed}
                      className="aspect-square w-full bg-emerald-950"
                      loading="lazy"
                      allowFullScreen
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                </>
              ) : (
                <p className="mt-5 text-sm text-emerald-200/60">Peta lokasi belum tersedia.</p>
              )}
            </div>
          </div>

          <div className="border-t border-emerald-800">
            <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-emerald-300 sm:flex-row">
              <span>{settings?.copyright || `© ${new Date().getFullYear()} ${settings?.nama_website || 'RT'}`}</span>
            </div>
          </div>
        </footer>
      </div>
    </PublicSettingsContext.Provider>
  )
}
