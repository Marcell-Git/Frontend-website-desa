import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  FaAnglesLeft,
  FaAnglesRight,
  FaArrowRightFromBracket,
  FaBars,
  FaChevronDown,
  FaUser,
  FaXmark,
} from 'react-icons/fa6'
import { useAuth } from '../auth/AuthContext.jsx'
import { settingsApi } from '../api/index.js'
import Logo from './Logo.jsx'
import { findActiveGroup, sidebarItems, visibleGroups } from './adminNav.jsx'

const COLLAPSE_KEY = 'admin-sidebar-collapsed'

function readCollapsed() {
  try {
    return localStorage.getItem(COLLAPSE_KEY) === '1'
  } catch {
    return false
  }
}

function SideItem({ item, collapsed, onNavigate }) {
  const Icon = item.icon
  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onNavigate}
      title={collapsed ? item.label : undefined}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-full text-sm font-medium transition-colors ${
          collapsed ? 'h-11 w-11 justify-center' : 'px-3 py-2.5'
        } ${
          isActive
            ? 'bg-emerald-700 text-white shadow-sm shadow-emerald-900/20'
            : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
        }`
      }
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </NavLink>
  )
}

function UserMenu({ user, initials, onLogout }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    const esc = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', esc)
    }
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full bg-white py-1 pl-1 pr-3 shadow-sm ring-1 ring-black/5 hover:bg-slate-50"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-700 text-xs font-semibold text-white">
          {initials}
        </span>
        <span className="hidden max-w-32 truncate text-sm font-medium text-slate-700 sm:block">
          {user?.username}
        </span>
        <FaChevronDown className="h-3 w-3 text-slate-400" />
      </button>

      {open && (
        <div
          role="menu"
          className="animate-scale-in absolute right-0 z-50 mt-2 w-56 rounded-2xl bg-white p-2 shadow-xl ring-1 ring-black/5"
        >
          <div className="px-3 py-2">
            <div className="truncate text-sm font-semibold text-slate-800">{user?.username}</div>
            <div className="truncate text-xs text-slate-400">{user?.role}</div>
          </div>
          <div className="my-1 h-px bg-slate-100" />
          <Link
            to="/profil"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          >
            <FaUser className="h-3.5 w-3.5" /> Profil & Password
          </Link>
          <button
            role="menuitem"
            onClick={onLogout}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-rose-600 hover:bg-rose-50"
          >
            <FaArrowRightFromBracket className="h-3.5 w-3.5" /> Keluar
          </button>
        </div>
      )}
    </div>
  )
}

export default function Layout() {
  const { user, logout, can } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(readCollapsed)
  const [settings, setSettings] = useState(null)

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
    setDrawerOpen(false)
  }, [pathname])

  const toggleCollapsed = () => {
    setCollapsed((c) => {
      try {
        localStorage.setItem(COLLAPSE_KEY, c ? '0' : '1')
      } catch {
        // abaikan: preferensi ini tidak wajib tersimpan
      }
      return !c
    })
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const initials = (user && user.username ? user.username.trim() : '?')
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

  const groups = visibleGroups(can)
  const activeGroup = findActiveGroup(groups, pathname)
  const sideItems = sidebarItems(groups, activeGroup)
  const namaWebsite = settings?.nama_website || 'SIM RT 26'

  return (
    <div className="min-h-screen bg-[var(--admin-bg)]">
      <header className="sticky top-0 z-30 bg-[var(--admin-bg)]/85 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] items-center gap-3 px-3 py-3 lg:px-5">
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-600 shadow-sm ring-1 ring-black/5 lg:hidden"
            onClick={() => setDrawerOpen(true)}
            aria-label="Buka menu"
          >
            <FaBars className="h-4 w-4" />
          </button>

          <Link to="/dashboard" className="flex min-w-0 items-center gap-2.5">
            <Logo settings={settings} className="h-9 w-9 rounded-full" />
            <span className="hidden truncate font-display text-base font-bold text-emerald-800 sm:block">
              {namaWebsite}
            </span>
          </Link>

          <nav className="mx-auto hidden items-center gap-1 rounded-full bg-white p-1 shadow-sm ring-1 ring-black/5 lg:flex">
            {groups.map((g) => {
              // Pil hanya aktif jika halaman memang bagian kelompok ini.
              const active = g.items.some((i) => pathname === i.to || pathname.startsWith(`${i.to}/`))
              return (
                <Link
                  key={g.key}
                  to={g.items[0].to}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    active
                      ? 'bg-slate-100 text-slate-900'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {g.label}
                </Link>
              )
            })}
          </nav>

          <div className="ml-auto lg:ml-0">
            <UserMenu user={user} initials={initials} onLogout={handleLogout} />
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1600px] gap-5 px-3 pb-6 lg:px-5">
        {/* Sidebar desktop: item dari kelompok menu yang sedang aktif */}
        {activeGroup && (
          <aside
            className={`sticky top-[72px] hidden h-[calc(100vh-96px)] shrink-0 flex-col gap-3 lg:flex ${
              collapsed ? 'w-[60px]' : 'w-60'
            }`}
          >
            <div className="flex min-h-0 flex-1 flex-col rounded-[28px] bg-white p-2 shadow-sm ring-1 ring-black/5">
              {!collapsed && (
                <div className="px-3 pb-2 pt-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  {activeGroup.key === 'beranda' ? 'Menu' : activeGroup.label}
                </div>
              )}
              <nav className={`flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto ${collapsed ? 'items-center pt-1' : ''}`}>
                {sideItems.map((item) => (
                  <SideItem key={item.to} item={item} collapsed={collapsed} />
                ))}
              </nav>
            </div>

            <div className={`flex flex-col gap-1 rounded-[28px] bg-white p-2 shadow-sm ring-1 ring-black/5 ${collapsed ? 'items-center' : ''}`}>
              <SideItem
                item={{ to: '/profil', label: 'Profil', icon: FaUser }}
                collapsed={collapsed}
              />
              <button
                onClick={toggleCollapsed}
                title={collapsed ? 'Perlebar sidebar' : undefined}
                className={`flex items-center gap-3 rounded-full text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900 ${
                  collapsed ? 'h-11 w-11 justify-center' : 'px-3 py-2.5'
                }`}
              >
                {collapsed ? (
                  <FaAnglesRight className="h-4 w-4" />
                ) : (
                  <>
                    <FaAnglesLeft className="h-4 w-4" /> Ciutkan
                  </>
                )}
              </button>
            </div>
          </aside>
        )}

        <main className="min-w-0 flex-1 pt-2">
          <Outlet />
        </main>
      </div>

      {/* Drawer mobile: semua kelompok menu */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="animate-fade-in absolute inset-0 bg-black/30" onClick={() => setDrawerOpen(false)} />
          <aside className="absolute inset-y-3 left-3 flex w-72 max-w-[calc(100%-24px)] flex-col rounded-[28px] bg-white shadow-xl">
            <div className="flex items-center justify-between gap-3 p-4">
              <div className="flex min-w-0 items-center gap-2.5">
                <Logo settings={settings} className="h-9 w-9 rounded-full" />
                <span className="truncate font-display text-sm font-bold text-emerald-800">
                  {namaWebsite}
                </span>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
                aria-label="Tutup menu"
              >
                <FaXmark className="h-4 w-4" />
              </button>
            </div>
            <nav className="flex-1 space-y-4 overflow-y-auto px-3 pb-4">
              {groups.map((g) => (
                <div key={g.key}>
                  <div className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    {g.label}
                  </div>
                  <div className="space-y-1">
                    {g.items.map((item) => (
                      <SideItem key={item.to} item={item} collapsed={false} />
                    ))}
                  </div>
                </div>
              ))}
            </nav>
          </aside>
        </div>
      )}
    </div>
  )
}
