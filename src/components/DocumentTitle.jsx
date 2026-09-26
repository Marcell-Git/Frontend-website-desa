import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { getSettings } from '../api/settingsCache.js'

const PAGE_LABELS = [
  ['/dashboard', 'Dashboard'],
  ['/kartu-keluarga', 'Kartu Keluarga'],
  ['/anggota', 'Anggota Keluarga'],
  ['/anak-kos', 'Anak Kos / Warga Kontrak'],
  ['/kas', 'Kas'],
  ['/jenis-iuran', 'Jenis Iuran'],
  ['/iuran', 'Iuran'],
  ['/kategori-pengeluaran', 'Kategori Pengeluaran'],
  ['/pengeluaran', 'Pengeluaran'],
  ['/kelola-pengumuman', 'Pengumuman'],
  ['/kelola-pengaduan', 'Pengaduan'],
  ['/kelola-laporan', 'Laporan'],
  ['/audit-log', 'Audit Log'],
  ['/backup-database', 'Backup Database'],
  ['/user-management', 'Manajemen User'],
  ['/role-management', 'Manajemen Role'],
  ['/pengaturan', 'Pengaturan'],
  ['/profil', 'Profil'],
  ['/login', 'Masuk'],
  ['/visi-misi', 'Visi & Misi'],
  ['/berita-kegiatan', 'Berita & Kegiatan'],
  ['/kelola-berita-kegiatan', 'Kelola Berita & Kegiatan'],
  ['/inventaris', 'Inventaris Barang RT'],
  ['/peraturan', 'Peraturan RT'],
  ['/kelola-peraturan', 'Kelola Peraturan RT'],
  ['/pengurus', 'Pengurus RT'],
  ['/pendataan-anak-kos', 'Pendataan Anak Kos / Warga Kontrak'],
  ['/statistik', 'Statistik Warga'],
  ['/kelola-inventaris', 'Kelola Inventaris'],
  ['/kelola-pengurus', 'Kelola Pengurus'],
]

function pageLabel(pathname) {
  for (const [prefix, label] of PAGE_LABELS) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) return label
  }
  if (pathname === '/' || pathname === '') return 'Beranda'
  return ''
}

export default function DocumentTitle() {
  const location = useLocation()

  useEffect(() => {
    let active = true
    getSettings().then((settings) => {
      if (!active) return
      const website = settings?.nama_website || 'SIM RT'
      const label = pageLabel(location.pathname)
      document.title = label ? `${label} - ${website}` : website
    })
    return () => {
      active = false
    }
  }, [location.pathname])

  return null
}
