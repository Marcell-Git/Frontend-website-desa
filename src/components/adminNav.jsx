import {
  FaTableCellsLarge,
  FaIdCard,
  FaBed,
  FaWallet,
  FaCoins,
  FaReceipt,
  FaTags,
  FaLayerGroup,
  FaFileLines,
  FaBullhorn,
  FaNewspaper,
  FaBoxesStacked,
  FaScaleBalanced,
  FaUserTie,
  FaCircleExclamation,
  FaClockRotateLeft,
  FaUsersGear,
  FaUserShield,
  FaDatabase,
  FaGear,
  FaBullseye,
} from 'react-icons/fa6'

// Menu admin dikelompokkan per modul. Kelompok tampil sebagai menu pil di
// topbar, sedangkan item-itemnya tampil di sidebar kiri.
export const navGroups = [
  {
    key: 'beranda',
    label: 'Beranda',
    icon: FaTableCellsLarge,
    items: [
      { to: '/dashboard', label: 'Dashboard', permission: 'dashboard:view', icon: FaTableCellsLarge, end: true },
    ],
  },
  {
    key: 'master',
    label: 'Master Data',
    icon: FaIdCard,
    items: [
      { to: '/kartu-keluarga', label: 'Kartu Keluarga', permission: 'kartu-keluarga:view', icon: FaIdCard },
      { to: '/anak-kos', label: 'Anak Kos / Kontrak', permission: 'anak-kos:view', icon: FaBed },
    ],
  },
  {
    key: 'keuangan',
    label: 'Keuangan',
    icon: FaWallet,
    items: [
      { to: '/kas', label: 'Rekap Kas', permission: 'kas:view', icon: FaWallet },
      { to: '/iuran', label: 'Rekap Iuran', permission: 'iuran:view', icon: FaCoins },
      { to: '/pengeluaran', label: 'Rekap Pengeluaran', permission: 'pengeluaran:view', icon: FaReceipt },
      { to: '/jenis-iuran', label: 'Jenis Iuran', permission: 'jenis-iuran:view', icon: FaTags },
      { to: '/kategori-pengeluaran', label: 'Kategori Pengeluaran', permission: 'kategori-pengeluaran:view', icon: FaLayerGroup },
      { to: '/kelola-laporan', label: 'Laporan', permission: 'laporan:view', icon: FaFileLines },
    ],
  },
  {
    key: 'informasi',
    label: 'Informasi',
    icon: FaBullhorn,
    items: [
      { to: '/kelola-pengumuman', label: 'Pengumuman', permission: 'pengumuman:view', icon: FaBullhorn },
      { to: '/kelola-berita-kegiatan', label: 'Berita & Kegiatan', permission: 'berita-kegiatan:view', icon: FaNewspaper },
      { to: '/kelola-inventaris', label: 'Inventaris', permission: 'inventaris:view', icon: FaBoxesStacked },
      { to: '/kelola-peraturan', label: 'Peraturan RT', permission: 'peraturan:view', icon: FaScaleBalanced },
      { to: '/kelola-pengurus', label: 'Pengurus RT', permission: 'pengurus:view', icon: FaUserTie },
      { to: '/kelola-visi-misi', label: 'Visi & Misi', permission: 'website-settings:view', icon: FaBullseye },
      { to: '/kelola-pengaduan', label: 'Pengaduan', permission: 'pengaduan:view', icon: FaCircleExclamation },
    ],
  },
  {
    key: 'sistem',
    label: 'Sistem',
    icon: FaGear,
    items: [
      { to: '/audit-log', label: 'Audit Log', permission: 'audit-log:view', icon: FaClockRotateLeft },
      { to: '/user-management', label: 'Manajemen User', permission: 'user:view', icon: FaUsersGear },
      { to: '/role-management', label: 'Manajemen Role', permission: 'role:view', icon: FaUserShield },
      { to: '/backup-database', label: 'Backup Database', permission: 'backup:view', icon: FaDatabase },
      { to: '/pengaturan', label: 'Pengaturan', permission: 'website-settings:view', icon: FaGear },
    ],
  },
]

export function visibleGroups(can) {
  return navGroups
    .map((g) => ({ ...g, items: g.items.filter((i) => can(i.permission)) }))
    .filter((g) => g.items.length > 0)
}

const matches = (pathname, to) => pathname === to || pathname.startsWith(`${to}/`)

// Halaman di luar kelompok mana pun (mis. Profil) memakai sidebar Beranda
// supaya tata letaknya tidak berubah saat dibuka.
export function findActiveGroup(groups, pathname) {
  return (
    groups.find((g) => g.items.some((i) => matches(pathname, i.to))) ??
    groups.find((g) => g.key === 'beranda') ??
    groups[0] ??
    null
  )
}

// Isi sidebar untuk kelompok aktif. Beranda hanya punya satu halaman, jadi
// sidebarnya diisi pintasan ke kelompok lain agar tidak kosong.
export function sidebarItems(groups, activeGroup) {
  if (!activeGroup) return []
  if (activeGroup.key !== 'beranda') return activeGroup.items
  return [
    ...activeGroup.items,
    ...groups
      .filter((g) => g.key !== 'beranda')
      .map((g) => ({ to: g.items[0].to, label: g.label, icon: g.icon })),
  ]
}
