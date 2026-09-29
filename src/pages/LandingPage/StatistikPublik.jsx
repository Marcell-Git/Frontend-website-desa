import { useEffect, useMemo, useState } from 'react'
import { Bar, Doughnut } from 'react-chartjs-2'
import { publicApi } from '../../api/index.js'
import { errorMessage } from '../../api/client.js'
import { usePublicSettings } from '../../components/PublicLayout.jsx'
import { EmptyState } from '../../components/ui.jsx'
import StatCard from './StatCard.jsx'
import '../../lib/chartjs.js'

const warnaGrafik = {
  utama: '#059669',
  kedua: '#34d399',
  aksen: '#f59e0b',
  agregat: '#cbd5e1',
}

const formatJumlah = (value) => Number(value || 0).toLocaleString('id-ID')

const formatPersen = (value) =>
  `${Number(value || 0).toLocaleString('id-ID', { maximumFractionDigits: 1 })}%`

const isAgregat = (label) => label.startsWith('Lainnya') || label === 'Belum diisi'

const warnaBatang = (label) => (isAgregat(label) ? warnaGrafik.agregat : warnaGrafik.utama)

// Menulis total warga di tengah lingkaran, sehingga legenda cukup
// menampilkan nama kategori tanpa angka.
function totalTengah(chart, _args, options) {
  if (!options?.total) return
  const { ctx, chartArea } = chart
  if (!chartArea) return
  const x = (chartArea.left + chartArea.right) / 2
  const y = (chartArea.top + chartArea.bottom) / 2
  ctx.save()
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = '#0f172a'
  ctx.font = '700 24px "Plus Jakarta Sans", Inter, sans-serif'
  ctx.fillText(formatJumlah(options.total), x, y - 8)
  ctx.fillStyle = '#64748b'
  ctx.font = '600 10px Inter, sans-serif'
  ctx.fillText('WARGA', x, y + 13)
  ctx.restore()
}

const opsiLingkaran = (items) => ({
  responsive: true,
  maintainAspectRatio: false,
  cutout: '68%',
  plugins: {
    legend: { display: false },
    totalTengah: { total: items.reduce((sum, item) => sum + item.jumlah, 0) },
    tooltip: {
      callbacks: {
        label: (ctx) => `${ctx.label}: ${formatJumlah(ctx.parsed)} warga`,
      },
    },
  },
})

const opsiBatang = () => ({
  indexAxis: 'y',
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx) => `${formatJumlah(ctx.parsed.x)} warga`,
      },
    },
  },
  scales: {
    x: {
      beginAtZero: true,
      border: { display: false },
      grid: { color: '#f1f5f9' },
      ticks: { precision: 0, font: { size: 10 }, maxTicksLimit: 6 },
    },
    y: {
      border: { display: false },
      grid: { display: false },
      ticks: { font: { size: 11 } },
    },
  },
})

const IconWarga = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
  </svg>
)

const IconKartuKeluarga = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm10.5-11a4.5 4.5 0 10-9 0 4.5 4.5 0 009 0zm-1.8 8.2l2.4 2.4" />
  </svg>
)

const IconKos = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
  </svg>
)

function PanelLingkaran({ title, items, warna }) {
  const data = useMemo(
    () => ({
      labels: items.map((item) => item.label),
      datasets: [
        {
          data: items.map((item) => item.jumlah),
          backgroundColor: items.map((_, i) => warna[i] ?? warnaGrafik.agregat),
          borderColor: '#ffffff',
          borderWidth: 2,
        },
      ],
    }),
    [items, warna],
  )

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-700">{title}</h2>
      <div className="mt-2 h-48">
        <Doughnut data={data} options={opsiLingkaran(items)} plugins={[totalTengah]} />
      </div>
      <ul className="mt-4 space-y-2">
        {items.map((item, i) => (
          <li key={item.label} className="flex items-center gap-2 text-sm">
            <span
              aria-hidden="true"
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: warna[i] ?? warnaGrafik.agregat }}
            />
            <span className="min-w-0 flex-1 truncate text-slate-600">{item.label}</span>
            <span className="shrink-0 tabular-nums text-slate-400">
              {formatPersen(item.persen)}
            </span>
            <span className="w-12 shrink-0 text-right font-semibold tabular-nums text-slate-800">
              {formatJumlah(item.jumlah)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function StatistikPublik() {
  const { settings } = usePublicSettings()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!settings) return
    if (!settings.show_statistik) return

    let active = true
    setLoading(true)
    setError('')
    publicApi
      .statistik()
      .then((res) => {
        if (active) setData(res)
      })
      .catch((err) => {
        if (active) {
          setData(null)
          setError(errorMessage(err))
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [settings])

  const gender = data?.gender ?? []
  const statusKK = data?.status_kk ?? []
  const pekerjaan = (data?.pekerjaan ?? []).filter((item) => item.jumlah > 0)

  const dataPekerjaan = useMemo(
    () => ({
      labels: pekerjaan.map((item) => item.label),
      datasets: [
        {
          data: pekerjaan.map((item) => item.jumlah),
          backgroundColor: pekerjaan.map((item) => warnaBatang(item.label)),
          borderRadius: 4,
          barPercentage: 0.75,
        },
      ],
    }),
    [pekerjaan],
  )

  if (!settings) return null

  if (!settings.show_statistik) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center text-sm text-slate-500">
        Halaman statistik warga tidak tersedia.
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div>
        <h1 className="text-balance font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Statistik Warga
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Komposisi warga RT 26 beserta anak kos dan warga kontrak yang tercatat.
        </p>
      </div>

      {error && (
        <p className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {loading && !data && (
        <div className="mt-8 space-y-6">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl border border-slate-200 bg-slate-100" />
            ))}
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {[0, 1].map((i) => (
              <div key={i} className="h-72 animate-pulse rounded-xl border border-slate-200 bg-slate-100" />
            ))}
          </div>
        </div>
      )}

      {data && data.total_warga === 0 && (
        <div className="mt-8 rounded-xl border border-slate-200 bg-white">
          <EmptyState message="Belum ada data warga yang tercatat." />
        </div>
      )}

      {data && data.total_warga > 0 && (
        <>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
            <StatCard
              label="Total Warga"
              value={formatJumlah(data.total_warga)}
              highlight
              icon={<IconWarga />}
            />
            <StatCard
              label="Kartu Keluarga"
              value={formatJumlah(data.total_kk)}
              icon={<IconKartuKeluarga />}
            />
            <StatCard
              label="Anak Kos"
              value={formatJumlah(data.total_anak_kos)}
              icon={<IconKos />}
            />
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {gender.length > 0 && (
              <PanelLingkaran
                title="Jenis Kelamin"
                items={gender}
                warna={[warnaGrafik.utama, warnaGrafik.aksen]}
              />
            )}
            {statusKK.length > 0 && (
              <PanelLingkaran
                title="Kedudukan dalam Kartu Keluarga"
                items={statusKK}
                warna={[warnaGrafik.utama, warnaGrafik.kedua, warnaGrafik.aksen]}
              />
            )}
          </div>

          {pekerjaan.length > 0 && (
            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-700">Pekerjaan</h2>
              <div className="mt-4 h-80">
                <Bar data={dataPekerjaan} options={opsiBatang()} />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
