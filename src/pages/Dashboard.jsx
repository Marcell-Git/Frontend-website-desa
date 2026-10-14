import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Doughnut } from 'react-chartjs-2'
import {
  FaUsers,
  FaHouse,
  FaWallet,
  FaCircleExclamation,
  FaIdCard,
  FaBed,
  FaCoins,
  FaReceipt,
  FaArrowUpRightFromSquare,
  FaClockRotateLeft,
} from 'react-icons/fa6'
import { dashboardApi, pengaduanApi } from '../api/index.js'
import { useAuth } from '../auth/AuthContext.jsx'
import { Badge, Card, Spinner, EmptyState } from '../components/ui.jsx'
import { GrafikKeuangan } from '../components/GrafikKeuangan.jsx'
import { errorMessage } from '../api/client.js'
import '../lib/chartjs.js'

function ArrowButton({ featured }) {
  return (
    <span
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ring-1 transition-colors ${
        featured
          ? 'bg-white/10 text-white ring-white/20 group-hover:bg-white/20'
          : 'text-slate-500 ring-slate-200 group-hover:bg-emerald-700 group-hover:text-white group-hover:ring-emerald-700'
      }`}
    >
      <FaArrowUpRightFromSquare className="h-3 w-3" />
    </span>
  )
}

function StatCard({ label, value, hint, icon, tone, to, featured = false }) {
  return (
    <Link
      to={to}
      className={`group flex h-full flex-col justify-between gap-5 rounded-[28px] p-5 shadow-sm ring-1 transition-all hover:-translate-y-0.5 hover:shadow-md ${
        featured
          ? 'bg-gradient-to-br from-emerald-600 to-emerald-800 text-white ring-emerald-800'
          : 'bg-white ring-black/5'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
              featured ? 'bg-white/15 text-white' : tone
            }`}
          >
            {icon}
          </span>
          <span className={`text-sm font-medium ${featured ? 'text-emerald-50' : 'text-slate-600'}`}>
            {label}
          </span>
        </div>
        <ArrowButton featured={featured} />
      </div>
      <div className="min-w-0">
        <div
          className={`truncate text-3xl font-semibold tracking-tight ${
            featured ? 'text-white' : 'text-slate-900'
          }`}
        >
          {typeof value === 'number' ? value.toLocaleString('id-ID') : value}
        </div>
        {hint && (
          <div className={`mt-1 truncate text-xs ${featured ? 'text-emerald-100' : 'text-slate-400'}`}>
            {hint}
          </div>
        )}
      </div>
    </Link>
  )
}

const usiaWarna = {
  Balita: { color: '#ec4899', dot: 'bg-pink-500' },
  Anak: { color: '#3b82f6', dot: 'bg-blue-500' },
  Remaja: { color: '#10b981', dot: 'bg-emerald-500' },
  Dewasa: { color: '#f59e0b', dot: 'bg-amber-500' },
  Lansia: { color: '#a855f7', dot: 'bg-purple-500' },
}

const opsiDonat = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '55%',
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx) => {
          const total = ctx.dataset.data.reduce((a, b) => a + b, 0)
          const persen = total ? Math.round((ctx.parsed / total) * 100) : 0
          return `${ctx.label}: ${ctx.parsed.toLocaleString('id-ID')} warga (${persen}%)`
        },
      },
    },
  },
}

function DistribusiUsia({ items }) {
  const data = useMemo(
    () => ({
      labels: items.map((i) => i.kelompok),
      datasets: [
        {
          data: items.map((i) => i.jumlah),
          backgroundColor: items.map((i) => usiaWarna[i.kelompok]?.color ?? '#94a3b8'),
          borderColor: '#ffffff',
          borderWidth: 2,
          hoverOffset: 6,
        },
      ],
    }),
    [items],
  )

  const total = items.reduce((a, i) => a + i.jumlah, 0)

  return (
    <Card className="p-5">
      <CardHeader title="Distribusi Usia Warga" subtitle="Berdasarkan tanggal lahir" />
      {total === 0 ? (
        <div className="mt-4">
          <EmptyState message="Belum ada data tanggal lahir warga." />
        </div>
      ) : (
        <>
          <div className="relative mx-auto mt-4 h-60 max-w-60">
            <Doughnut data={data} options={opsiDonat} />
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-slate-900">{total.toLocaleString('id-ID')}</span>
              <span className="text-xs text-slate-500">warga</span>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-2">
            {items.map((i) => (
              <span key={i.kelompok} className="flex items-center gap-1.5 text-sm text-slate-600">
                <span className={`h-2.5 w-2.5 rounded-full ${usiaWarna[i.kelompok]?.dot ?? 'bg-slate-400'}`} />
                {i.kelompok}
              </span>
            ))}
          </div>
        </>
      )}
    </Card>
  )
}

const quickNavItems = [
  { to: '/kartu-keluarga', title: 'Kartu Keluarga', permission: 'kartu-keluarga:view', tone: 'bg-emerald-500', icon: <FaIdCard className="h-4 w-4" /> },
  { to: '/anak-kos', title: 'Anak Kos', permission: 'anak-kos:view', tone: 'bg-blue-500', icon: <FaBed className="h-4 w-4" /> },
  { to: '/kas', title: 'Rekap Kas', permission: 'kas:view', tone: 'bg-amber-500', icon: <FaWallet className="h-4 w-4" /> },
  { to: '/iuran', title: 'Rekap Iuran', permission: 'iuran:view', tone: 'bg-teal-500', icon: <FaCoins className="h-4 w-4" /> },
  { to: '/pengeluaran', title: 'Pengeluaran', permission: 'pengeluaran:view', tone: 'bg-rose-500', icon: <FaReceipt className="h-4 w-4" /> },
]

function NavigasiCepat({ can }) {
  const items = quickNavItems.filter((i) => can(i.permission))
  if (items.length === 0) return null
  return (
    <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
      {items.map((i) => (
        <Link
          key={i.to}
          to={i.to}
          className="group flex items-center gap-3 rounded-full bg-white py-2 pl-2 pr-4 shadow-sm ring-1 ring-black/5 transition-all hover:-translate-y-0.5 hover:shadow-md"
        >
          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white ${i.tone}`}>
            {i.icon}
          </span>
          <span className="truncate text-sm font-medium text-slate-700 group-hover:text-emerald-700">
            {i.title}
          </span>
        </Link>
      ))}
    </div>
  )
}

function CardHeader({ title, subtitle, to }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <h3 className="text-base font-semibold text-slate-800">{title}</h3>
        {subtitle && <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p>}
      </div>
      {to && (
        <Link to={to} className="group" aria-label={`Lihat semua ${title.toLowerCase()}`}>
          <ArrowButton />
        </Link>
      )}
    </div>
  )
}

const statusPengaduan = {
  menunggu: { label: 'Menunggu', color: 'amber' },
  diproses: { label: 'Diproses', color: 'blue' },
  selesai: { label: 'Selesai', color: 'green' },
}

function PengaduanTerbaru() {
  const [items, setItems] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    pengaduanApi
      .list({ page: 1, limit: 5 })
      .then((res) => setItems(res.data))
      .catch((err) => setError(errorMessage(err)))
  }, [])

  return (
    <Card className="p-5">
      <CardHeader title="Pengaduan Terbaru" subtitle="5 laporan warga terakhir" to="/kelola-pengaduan" />
      {error ? (
        <p className="mt-4 text-sm text-red-600">{error}</p>
      ) : !items ? (
        <div className="py-6">
          <Spinner />
        </div>
      ) : items.length === 0 ? (
        <p className="mt-4 text-sm text-slate-400">Belum ada pengaduan.</p>
      ) : (
        <ul className="mt-3 divide-y divide-slate-100">
          {items.map((p) => {
            const st = statusPengaduan[p.status] ?? { label: p.status, color: 'slate' }
            return (
              <li key={p.id}>
                <Link
                  to={`/kelola-pengaduan/${p.id}`}
                  className="-mx-2 flex items-center justify-between gap-3 rounded-2xl px-2 py-3 hover:bg-slate-50"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-slate-800">{p.nama_pelapor}</div>
                    <div className="truncate text-xs text-slate-400">
                      {p.lokasi} &middot; {new Date(p.created_at).toLocaleDateString('id-ID')}
                    </div>
                  </div>
                  <Badge color={st.color}>{st.label}</Badge>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}

function AktivitasTerbaru({ items, auditLog, className = '' }) {
  return (
    <Card className={`p-5 ${className}`}>
      <CardHeader title="Aktivitas Terbaru" subtitle="Perubahan data oleh pengurus" to={auditLog ? '/audit-log' : undefined} />
      {items.length === 0 ? (
        <p className="mt-4 text-sm text-slate-400">Belum ada aktivitas.</p>
      ) : (
        <ul className="mt-3 divide-y divide-slate-100">
          {items.slice(0, 6).map((a) => (
            <li key={a.id} className="flex items-start gap-3 py-3">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                <FaClockRotateLeft className="h-3.5 w-3.5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-slate-800">{a.aktivitas}</div>
                <div className="truncate text-xs text-slate-400">
                  {a.deskripsi ? `${a.deskripsi} · ` : ''}
                  {a.nama_pengguna}
                </div>
              </div>
              <span className="shrink-0 text-xs text-slate-400">{a.waktu}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

export default function Dashboard() {
  const { can, user } = useAuth()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    dashboardApi
      .summary()
      .then(setData)
      .catch((err) => setError(errorMessage(err)))
  }, [])

  if (error) return <div className="text-sm text-red-600">{error}</div>
  if (!data) return <Spinner />

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-medium tracking-tight text-slate-900 sm:text-4xl">
          Selamat datang, <span className="font-normal text-slate-400">{user?.username}</span>
        </h1>
        <p className="mt-1.5 text-sm text-slate-500">Ringkasan data RT 26 hari ini.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Warga"
          value={data.total_penduduk}
          hint="Anggota keluarga terdata"
          to="/kartu-keluarga"
          tone="bg-emerald-50 text-emerald-700"
          icon={<FaUsers className="h-5 w-5" />}
        />
        <StatCard
          label="Kepala Keluarga"
          value={data.total_kk}
          hint={
            data.total_kk
              ? `Rata-rata ${(data.total_penduduk / data.total_kk).toLocaleString('id-ID', { maximumFractionDigits: 1 })} jiwa/KK`
              : 'Belum ada KK'
          }
          to="/kartu-keluarga"
          tone="bg-blue-50 text-blue-600"
          icon={<FaHouse className="h-5 w-5" />}
        />
        <StatCard
          label="Saldo Kas RT"
          value={`Rp ${Number(data.saldo_kas || 0).toLocaleString('id-ID')}`}
          to="/kas"
          featured
          hint={`Keluar bulan ini Rp ${Number(data.pengeluaran_bulan_ini || 0).toLocaleString('id-ID')}`}
          tone="bg-amber-50 text-amber-600"
          icon={<FaWallet className="h-5 w-5" />}
        />
        <StatCard
          label="Pengaduan Aktif"
          value={data.pengaduan_aktif ?? 0}
          to="/kelola-pengaduan"
          hint="Menunggu & sedang diproses"
          tone="bg-rose-50 text-rose-600"
          icon={<FaCircleExclamation className="h-5 w-5" />}
        />
      </div>

      <NavigasiCepat can={can} />

      <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <GrafikKeuangan className="xl:col-span-2" />
        <DistribusiUsia items={data.distribusi_usia ?? []} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <AktivitasTerbaru
          items={data.aktivitas_terbaru ?? []}
          auditLog={can('audit-log:view')}
          className={can('pengaduan:view') ? 'xl:col-span-2' : 'xl:col-span-3'}
        />
        {can('pengaduan:view') && <PengaduanTerbaru />}
      </div>
    </div>
  )
}
