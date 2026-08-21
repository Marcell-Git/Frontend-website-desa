import { useEffect, useState } from 'react'
import { publicApi } from '../../api/index.js'
import { errorMessage } from '../../api/client.js'
import { usePublicSettings } from '../../components/PublicLayout.jsx'
import { rupiah, NAMA_BULAN } from './format.js'

function StatCard({ label, value, highlight }) {
  return (
    <div
      className={`rounded-xl border p-4 shadow-sm ${
        highlight ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-white'
      }`}
    >
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</div>
      <div className={`mt-1 text-base font-bold sm:text-lg ${highlight ? 'text-emerald-700' : 'text-slate-900'}`}>
        {value}
      </div>
    </div>
  )
}

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
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Laporan Keuangan</h1>
          <p className="mt-1 text-sm text-slate-500">
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
            <StatCard label={`Total Kas ${tahun}`} value={rupiah(data.ringkasan.total_kas)} />
            <StatCard label={`Total Iuran ${tahun}`} value={rupiah(data.ringkasan.total_iuran)} />
            <StatCard label={`Total Pengeluaran ${tahun}`} value={rupiah(data.ringkasan.total_pengeluaran)} />
            <StatCard label="Saldo Akhir" value={rupiah(data.ringkasan.saldo_akhir)} highlight />
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
