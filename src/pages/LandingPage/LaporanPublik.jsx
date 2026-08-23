import { useEffect, useState } from 'react'
import { publicApi } from '../../api/index.js'
import { errorMessage } from '../../api/client.js'
import { usePublicSettings } from '../../components/PublicLayout.jsx'
import StatCard from './StatCard.jsx'
import { rupiah, NAMA_BULAN } from './format.js'

const IconWallet = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
  </svg>
)

const IconWarga = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
  </svg>
)

const IconPengeluaran = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
)

const IconSaldo = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971z" />
  </svg>
)

const TAHUN_AWAL = 2020

export default function LaporanPublik() {
  const { settings } = usePublicSettings()
  const currentYear = new Date().getFullYear()
  const [tahun, setTahun] = useState(currentYear)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!settings) return
    if (!settings.show_laporan) return

    let active = true
    setLoading(true)
    setError('')
    publicApi
      .laporan(tahun)
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
  }, [settings, tahun])

  if (!settings) return null

  if (!settings.show_laporan) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center text-sm text-slate-500">
        Halaman laporan tidak tersedia.
      </div>
    )
  }

  const years = []
  for (let y = currentYear; y >= TAHUN_AWAL; y--) years.push(y)

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div>
          <h1 className="text-balance font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Laporan Keuangan
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Ringkasan kas, iuran, dan pengeluaran RT untuk transparansi warga.
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <span className="font-medium text-slate-700">Tahun</span>
          <select
            value={tahun}
            onChange={(e) => setTahun(Number(e.target.value))}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error && (
        <p className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {loading && !data && (
        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl border border-slate-200 bg-slate-100" />
          ))}
        </div>
      )}

      {data?.ringkasan && (
        <>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <StatCard label={`Total Kas ${tahun}`} value={rupiah(data.ringkasan.total_kas)} icon={<IconWallet />} />
            <StatCard label={`Total Iuran ${tahun}`} value={rupiah(data.ringkasan.total_iuran)} icon={<IconWarga />} />
            <StatCard label={`Total Pengeluaran ${tahun}`} value={rupiah(data.ringkasan.total_pengeluaran)} icon={<IconPengeluaran />} />
            <StatCard label="Saldo Akhir" value={rupiah(data.ringkasan.saldo_akhir)} highlight icon={<IconSaldo />} />
          </div>

          <div className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="font-semibold text-slate-900">Rekap Bulanan {tahun}</h2>
              <p className="mt-0.5 text-xs text-slate-400">
                Saldo akhir dihitung dari akumulasi seluruh transaksi hingga bulan terpilih.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-5 py-3 font-medium">Bulan</th>
                    <th className="px-5 py-3 font-medium">Kas</th>
                    <th className="px-5 py-3 font-medium">Iuran</th>
                    <th className="px-5 py-3 font-medium">Pengeluaran</th>
                    <th className="px-5 py-3 font-medium">Saldo Akhir</th>
                  </tr>
                </thead>
                <tbody>
                  {data.rekap_bulanan.map((row) => (
                    <tr key={row.bulan} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60">
                      <td className="px-5 py-3 font-medium text-slate-800">{NAMA_BULAN[row.bulan - 1]}</td>
                      <td className="px-5 py-3 text-slate-600">{rupiah(row.kas)}</td>
                      <td className="px-5 py-3 text-slate-600">{rupiah(row.iuran)}</td>
                      <td className="px-5 py-3 text-slate-600">{rupiah(row.pengeluaran)}</td>
                      <td className="px-5 py-3 font-semibold text-emerald-700">{rupiah(row.saldo_akhir)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
