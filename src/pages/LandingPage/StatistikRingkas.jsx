import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { publicApi } from '../../api/index.js'
import { usePublicSettings } from '../../components/PublicLayout.jsx'
import StatCard from './StatCard.jsx'

const formatJumlah = (value) => Number(value || 0).toLocaleString('id-ID')

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

export default function StatistikRingkas() {
  const { settings } = usePublicSettings()
  const [data, setData] = useState(null)

  useEffect(() => {
    if (!settings) return
    if (!settings.show_statistik) return

    let active = true
    publicApi
      .statistik()
      .then((res) => {
        if (active) setData(res)
      })
      .catch(() => {
        if (active) setData(null)
      })
    return () => {
      active = false
    }
  }, [settings])

  if (!data || data.total_warga === 0) return null

  return (
    <section className="mx-auto max-w-6xl px-4 pb-16 pt-14 sm:pt-16">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div>
          <h2 className="text-balance font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Statistik Warga
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Ringkasan jumlah warga, kartu keluarga, dan anak kos yang tercatat.
          </p>
        </div>
        <Link
          to="/statistik"
          className="group inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 transition-colors hover:text-emerald-800"
        >
          Lihat rincian
          <span
            aria-hidden="true"
            className="transition-transform duration-300 group-hover:translate-x-0.5"
          >
            →
          </span>
        </Link>
      </div>
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
    </section>
  )
}
