import { useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'
import { settingsApi } from '../api/index.js'
import { PermissionGate } from './ProtectedRoute.jsx'
import Logo from './Logo.jsx'

const icon = 'inline-block h-4 w-4'

function NavItem({ to, label, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
          isActive
            ? 'bg-emerald-700 text-white'
            : 'text-slate-200 hover:bg-emerald-700/60 hover:text-white'
        }`
      }
    >
      {label}
    </NavLink>
  )
}

export default function Layout() {
  const { user, logout, can } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
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

  return (
    <div className="flex min-h-screen">
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-emerald-900 transition-transform lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center gap-3 border-b border-emerald-800 px-5 py-4">
            <Logo />
            <div>
              <div className="font-semibold text-white">
                {settings?.nama_website || 'SIM RT'}
              </div>
              {settings?.nama_rt && (
                <div className="text-xs text-emerald-300">{settings.nama_rt}</div>
              )}
            </div>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto p-3">
            <PermissionGate permission="dashboard:view">
              <NavItem to="/dashboard" label="Dashboard" end />
            </PermissionGate>

            {(can('kartu-keluarga:view') || can('anggota:view') || can('anak-kos:view')) && (
              <div className="pt-3">
                <div className="px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-emerald-400">
                  Master Data
                </div>
                <PermissionGate permission="kartu-keluarga:view">
                  <NavItem to="/kartu-keluarga" label="Kartu Keluarga" />
                </PermissionGate>
                <PermissionGate permission="anggota:view">
                  <NavItem to="/anggota" label="Anggota Keluarga" />
                </PermissionGate>
                <PermissionGate permission="anak-kos:view">
                  <NavItem to="/anak-kos" label="Anak Kos / Warga Kontrak" />
                </PermissionGate>
              </div>
            )}

            {(can('kas:view') || can('iuran:view') || can('pengeluaran:view') || can('jenis-iuran:view') || can('kategori-pengeluaran:view')) && (
              <div className="pt-3">
                <div className="px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-emerald-400">
                  Keuangan
                </div>
                <PermissionGate permission="kas:view">
                  <NavItem to="/kas" label="Rekap Kas" />
                </PermissionGate>
                <PermissionGate permission="iuran:view">
                  <NavItem to="/iuran" label="Rekap Iuran" />
                </PermissionGate>
                <PermissionGate permission="pengeluaran:view">
                  <NavItem to="/pengeluaran" label="Rekap Pengeluaran" />
                </PermissionGate>
                <PermissionGate permission="jenis-iuran:view">
                  <NavItem to="/jenis-iuran" label="Jenis Iuran" />
                </PermissionGate>
                <PermissionGate permission="kategori-pengeluaran:view">
                  <NavItem to="/kategori-pengeluaran" label="Kategori Pengeluaran" />
                </PermissionGate>
                <PermissionGate permission="laporan:view">
                  <NavItem to="/kelola-laporan" label="Laporan" />
                </PermissionGate>
              </div>
            )}

            {(can('pengumuman:view') || can('berita-kegiatan:view') || can('inventaris:view') || can('pengaduan:view')) && (
              <div className="pt-3">
                <div className="px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-emerald-400">
                  Informasi
                </div>
                <PermissionGate permission="pengumuman:view">
                  <NavItem to="/kelola-pengumuman" label="Pengumuman" />
                </PermissionGate>
                <PermissionGate permission="berita-kegiatan:view">
                  <NavItem to="/kelola-berita-kegiatan" label="Berita & Kegiatan" />
                </PermissionGate>
                <PermissionGate permission="inventaris:view">
                  <NavItem to="/kelola-inventaris" label="Inventaris" />
                </PermissionGate>
                <PermissionGate permission="pengaduan:view">
                  <NavItem to="/kelola-pengaduan" label="Pengaduan" />
                </PermissionGate>
              </div>
            )}

            {(can('audit-log:view') || can('user:view') || can('role:view') || can('website-settings:view') || can('backup:view')) && (
              <div className="pt-3">
                <div className="px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-emerald-400">
                  Sistem
                </div>
                <PermissionGate permission="audit-log:view">
                  <NavItem to="/audit-log" label="Audit Log" />
                </PermissionGate>
                <PermissionGate permission="user:view">
                  <NavItem to="/user-management" label="Manajemen User" />
                </PermissionGate>
                <PermissionGate permission="role:view">
                  <NavItem to="/role-management" label="Manajemen Role" />
                </PermissionGate>
                <PermissionGate permission="backup:view">
                  <NavItem to="/backup-database" label="Backup Database" />
                </PermissionGate>
                <PermissionGate permission="website-settings:view">
                  <NavItem to="/pengaturan" label="Pengaturan" />
                </PermissionGate>
              </div>
            )}

            <div className="pt-3">
              <div className="px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-emerald-400">
                Akun
              </div>
              <NavItem to="/profil" label="Profil & Password" />
            </div>
          </nav>

          <div className="border-t border-emerald-800 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-sm font-semibold text-white">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-white">
                  {user ? user.username : ''}
                </div>
                <div className="truncate text-xs text-emerald-300">{user ? user.role : ''}</div>
              </div>
              <button
                onClick={handleLogout}
                className="rounded-lg px-2 py-1 text-xs text-emerald-200 hover:bg-emerald-800 hover:text-white"
                title="Keluar"
              >
                Keluar
              </button>
            </div>
          </div>
        </div>
      </aside>

      {open && (
        <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setOpen(false)} />
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:px-6">
          <div className="flex items-center gap-3">
            <button
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
              onClick={() => setOpen((o) => !o)}
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
            <span className="text-sm font-medium text-slate-700">
              {settings?.nama_website || 'Sistem Informasi Manajemen RT'}
            </span>
          </div>
          <span className="hidden text-xs text-slate-400 sm:block">
            {new Date().toLocaleDateString('id-ID', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </span>
        </header>

        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
