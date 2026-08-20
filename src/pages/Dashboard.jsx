import { useEffect, useState } from 'react'
import { dashboardApi } from '../api/index.js'
import { Card, Spinner, PageHeader } from '../components/ui.jsx'
import { errorMessage } from '../api/client.js'

function StatCard({ label, value, accent }) {
  return (
    <Card className="p-5">
      <div className={`mb-2 h-1.5 w-10 rounded-full ${accent}`} />
      <div className="text-3xl font-bold text-slate-900">
        {typeof value === 'number' ? value.toLocaleString('id-ID') : value}
      </div>
      <div className="mt-1 text-sm text-slate-500">{label}</div>
    </Card>
  )
}

export default function Dashboard() {
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
      <PageHeader
        title="Dashboard"
        description="Ringkasan data warga dan aktivitas terbaru RT 26"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Kartu Keluarga" value={data.total_kk} accent="bg-emerald-500" />
        <StatCard label="Total Penduduk" value={data.total_penduduk} accent="bg-blue-500" />
        <StatCard
          label="Saldo Kas"
          value={`Rp ${Number(data.saldo_kas || 0).toLocaleString('id-ID')}`}
          accent="bg-amber-500"
        />
        <StatCard
          label="Pengeluaran Bulan Ini"
          value={`Rp ${Number(data.pengeluaran_bulan_ini || 0).toLocaleString('id-ID')}`}
          accent="bg-rose-500"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-slate-700">Modul Lain</h3>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Pengaduan Baru</span>
              <span className="font-semibold text-slate-900">{data.pengaduan_baru || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Pengaduan Diproses</span>
              <span className="font-semibold text-slate-900">{data.pengaduan_diproses || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Pengumuman Aktif</span>
              <span className="font-semibold text-slate-900">{data.pengumuman_aktif || 0}</span>
            </div>
          </div>
        </Card>

        <Card className="p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold text-slate-700">Aktivitas Terbaru</h3>
          {(!data.aktivitas_terbaru || data.aktivitas_terbaru.length === 0) && (
            <p className="mt-4 text-sm text-slate-400">Belum ada aktivitas.</p>
          )}
          <ul className="mt-4 space-y-3">
            {(data.aktivitas_terbaru || []).map((a) => (
              <li key={a.id} className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3 last:border-0">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-slate-800">{a.aktivitas}</div>
                  <div className="truncate text-xs text-slate-400">
                    {a.deskripsi} &middot; {a.nama_pengguna}
                  </div>
                </div>
                <span className="shrink-0 text-xs text-slate-400">{a.waktu}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  )
}
