import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { reportApi, exportApi, jenisIuranApi, kategoriPengeluaranApi } from '../../api/index.js'
import {
  Button,
  Card,
  EmptyState,
  PageHeader,
  TableSkeleton,
  Tabs,
  toolbarFieldClass,
} from '../../components/ui.jsx'
import { errorMessage } from '../../api/client.js'
import { useAuth } from '../../auth/AuthContext.jsx'
import { formatTanggal } from '../../lib/tanggal.js'

const formatRupiah = (n) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)

const months = [
  '', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

const tabs = [
  { key: 'kas', label: 'Laporan Kas' },
  { key: 'iuran', label: 'Laporan Iuran' },
  { key: 'pengeluaran', label: 'Laporan Pengeluaran' },
  { key: 'keuangan', label: 'Laporan Keuangan Bulanan' },
]

export default function LaporanPage() {
  const { can } = useAuth()
  const [activeTab, setActiveTab] = useState('kas')
  const [data, setData] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [filterBulan, setFilterBulan] = useState('')
  const [filterTahun, setFilterTahun] = useState('')
  const [filterJenisIuran, setFilterJenisIuran] = useState('')
  const [filterKategori, setFilterKategori] = useState('')
  const [jenisIuranList, setJenisIuranList] = useState([])
  const [kategoriList, setKategoriList] = useState([])
  const [exporting, setExporting] = useState('')
  const currentYear = new Date().getFullYear()

  useEffect(() => {
    jenisIuranApi.list({ limit: 100 }).then((res) => setJenisIuranList(res.data || []))
    kategoriPengeluaranApi.list({ limit: 100 }).then((res) => setKategoriList(res.data || []))
  }, [])

  const buildParams = useCallback(() => {
    const p = {}
    if (filterBulan) p.bulan = filterBulan
    if (filterTahun) p.tahun = filterTahun
    if (activeTab === 'iuran' && filterJenisIuran) p.jenis_iuran_id = filterJenisIuran
    if (activeTab === 'pengeluaran' && filterKategori) p.kategori_pengeluaran_id = filterKategori
    return p
  }, [filterBulan, filterTahun, filterJenisIuran, filterKategori, activeTab])

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    setData([])
    setSummary(null)
    const params = buildParams()
    const apiMap = {
      kas: reportApi.kas,
      iuran: reportApi.iuran,
      pengeluaran: reportApi.pengeluaran,
      keuangan: reportApi.keuangan,
    }
    apiMap[activeTab](params)
      .then((res) => {
        if (activeTab === 'keuangan') {
          setSummary(res.summary || {})
          setSummaryKas(res.kas || [])
          setSummaryIuran(res.iuran || [])
          setSummaryPengeluaran(res.pengeluaran || [])
        } else {
          setData(res || [])
        }
      })
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false))
  }, [activeTab, buildParams])

  const [summaryKas, setSummaryKas] = useState([])
  const [summaryIuran, setSummaryIuran] = useState([])
  const [summaryPengeluaran, setSummaryPengeluaran] = useState([])

  useEffect(() => {
    load()
  }, [load])

  const handleExport = async (type) => {
    setExporting(type)
    try {
      const params = buildParams()
      const fnMap = {
        'kas-pdf': exportApi.kasPdf,
        'kas-excel': exportApi.kasExcel,
        'iuran-pdf': exportApi.iuranPdf,
        'iuran-excel': exportApi.iuranExcel,
        'pengeluaran-pdf': exportApi.pengeluaranPdf,
        'pengeluaran-excel': exportApi.pengeluaranExcel,
      }
      await fnMap[type](params)
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setExporting('')
    }
  }

  const renderKasTable = () => (
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
          <th className="px-4 py-3">Tanggal</th>
          <th className="px-4 py-3">Sumber Kas</th>
          <th className="px-4 py-3 text-right">Nominal</th>
          <th className="px-4 py-3">Keterangan</th>
          <th className="px-4 py-3">Dibuat Oleh</th>
        </tr>
      </thead>
      <tbody>
        {data.map((it, i) => (
          <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
            <td className="px-4 py-3 text-slate-600">
              {formatTanggal(it.tanggal)}
            </td>
            <td className="px-4 py-3 font-medium text-slate-900">{it.sumber_kas}</td>
            <td className="px-4 py-3 text-right font-medium text-emerald-700">
              {formatRupiah(it.nominal)}
            </td>
            <td className="max-w-[200px] truncate px-4 py-3 text-slate-600">
              {it.keterangan || '-'}
            </td>
            <td className="px-4 py-3 text-slate-600">{it.dibuat_oleh}</td>
          </tr>
        ))}
        {data.length > 0 && (
          <tr className="bg-slate-50 font-semibold">
            <td className="px-4 py-3" colSpan={2}>Total</td>
            <td className="px-4 py-3 text-right text-emerald-700">
              {formatRupiah(data.reduce((s, it) => s + it.nominal, 0))}
            </td>
            <td className="px-4 py-3" colSpan={2}></td>
          </tr>
        )}
      </tbody>
    </table>
  )

  const renderIuranTable = () => (
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
          <th className="px-4 py-3">Tanggal</th>
          <th className="px-4 py-3">Jenis Iuran</th>
          <th className="px-4 py-3 text-right">Nominal</th>
          <th className="px-4 py-3">Keterangan</th>
          <th className="px-4 py-3">Dibuat Oleh</th>
        </tr>
      </thead>
      <tbody>
        {data.map((it, i) => (
          <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
            <td className="px-4 py-3 text-slate-600">
              {formatTanggal(it.tanggal)}
            </td>
            <td className="px-4 py-3 font-medium text-slate-900">{it.jenis_iuran}</td>
            <td className="px-4 py-3 text-right font-medium text-emerald-700">
              {formatRupiah(it.nominal)}
            </td>
            <td className="max-w-[200px] truncate px-4 py-3 text-slate-600">
              {it.keterangan || '-'}
            </td>
            <td className="px-4 py-3 text-slate-600">{it.dibuat_oleh}</td>
          </tr>
        ))}
        {data.length > 0 && (
          <tr className="bg-slate-50 font-semibold">
            <td className="px-4 py-3" colSpan={2}>Total</td>
            <td className="px-4 py-3 text-right text-emerald-700">
              {formatRupiah(data.reduce((s, it) => s + it.nominal, 0))}
            </td>
            <td className="px-4 py-3" colSpan={2}></td>
          </tr>
        )}
      </tbody>
    </table>
  )

  const renderPengeluaranTable = () => (
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
          <th className="px-4 py-3">Tanggal</th>
          <th className="px-4 py-3">Kategori</th>
          <th className="px-4 py-3 text-right">Nominal</th>
          <th className="px-4 py-3">Keterangan</th>
          <th className="px-4 py-3">Dibuat Oleh</th>
        </tr>
      </thead>
      <tbody>
        {data.map((it, i) => (
          <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
            <td className="px-4 py-3 text-slate-600">
              {formatTanggal(it.tanggal)}
            </td>
            <td className="px-4 py-3 font-medium text-slate-900">{it.kategori_pengeluaran}</td>
            <td className="px-4 py-3 text-right font-medium text-emerald-700">
              {formatRupiah(it.nominal)}
            </td>
            <td className="max-w-[200px] truncate px-4 py-3 text-slate-600">
              {it.keterangan || '-'}
            </td>
            <td className="px-4 py-3 text-slate-600">{it.dibuat_oleh}</td>
          </tr>
        ))}
        {data.length > 0 && (
          <tr className="bg-slate-50 font-semibold">
            <td className="px-4 py-3" colSpan={2}>Total</td>
            <td className="px-4 py-3 text-right text-emerald-700">
              {formatRupiah(data.reduce((s, it) => s + it.nominal, 0))}
            </td>
            <td className="px-4 py-3" colSpan={2}></td>
          </tr>
        )}
      </tbody>
    </table>
  )

  const renderKeuangan = () => {
    if (!summary) return null
    return (
      <div className="space-y-6">
        <div className="mx-5 mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="text-xs font-medium text-slate-500">Total Kas</div>
            <div className="mt-2 text-lg font-semibold text-slate-900">{formatRupiah(summary.total_kas)}</div>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="text-xs font-medium text-slate-500">Total Iuran</div>
            <div className="mt-2 text-lg font-semibold text-slate-900">{formatRupiah(summary.total_iuran)}</div>
          </div>
          <div className="rounded-2xl bg-rose-50 p-4">
            <div className="text-xs font-medium text-rose-500">Total Pengeluaran</div>
            <div className="mt-2 text-lg font-semibold text-rose-600">{formatRupiah(summary.total_pengeluaran)}</div>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 p-4">
            <div className="text-xs font-medium text-emerald-100">Saldo Akhir</div>
            <div className="mt-2 text-lg font-semibold text-white">{formatRupiah(summary.saldo_akhir)}</div>
          </div>
        </div>

        {summaryKas.length > 0 && (
          <div>
            <h4 className="mx-5 mb-2 text-sm font-semibold text-slate-700">Rincian Kas</h4>
            <div className="mx-5 overflow-x-auto rounded-2xl ring-1 ring-slate-100">
              <table className="w-full text-left text-sm table-fixed">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                    <th className="w-1/4 px-4 py-3">Tanggal</th>
                    <th className="w-1/4 px-4 py-3">Sumber</th>
                    <th className="w-1/4 px-4 py-3 text-right">Nominal</th>
                    <th className="w-1/4 px-4 py-3">Keterangan</th>
                  </tr>
                </thead>
                <tbody>
                  {summaryKas.map((it, i) => (
                    <tr key={i} className="border-b border-slate-100 last:border-0">
                      <td className="w-1/4 px-4 py-2 text-slate-600">{formatTanggal(it.tanggal)}</td>
                      <td className="w-1/4 px-4 py-2 font-medium text-slate-900">{it.sumber_kas}</td>
                      <td className="w-1/4 px-4 py-2 text-right text-emerald-700">{formatRupiah(it.nominal)}</td>
                      <td className="w-1/4 px-4 py-2 text-slate-600">{it.keterangan || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {summaryIuran.length > 0 && (
          <div>
            <h4 className="mx-5 mb-2 text-sm font-semibold text-slate-700">Rincian Iuran</h4>
            <div className="mx-5 overflow-x-auto rounded-2xl ring-1 ring-slate-100">
              <table className="w-full text-left text-sm table-fixed">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                    <th className="w-1/4 px-4 py-3">Tanggal</th>
                    <th className="w-1/4 px-4 py-3">Jenis</th>
                    <th className="w-1/4 px-4 py-3 text-right">Nominal</th>
                    <th className="w-1/4 px-4 py-3">Keterangan</th>
                  </tr>
                </thead>
                <tbody>
                  {summaryIuran.map((it, i) => (
                    <tr key={i} className="border-b border-slate-100 last:border-0">
                      <td className="w-1/4 px-4 py-2 text-slate-600">{formatTanggal(it.tanggal)}</td>
                      <td className="w-1/4 px-4 py-2 font-medium text-slate-900">{it.jenis_iuran}</td>
                      <td className="w-1/4 px-4 py-2 text-right text-emerald-700">{formatRupiah(it.nominal)}</td>
                      <td className="w-1/4 px-4 py-2 text-slate-600">{it.keterangan || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {summaryPengeluaran.length > 0 && (
          <div className="mb-5">
            <h4 className="mx-5 mb-2 text-sm font-semibold text-slate-700">Rincian Pengeluaran</h4>
            <div className="mx-5 overflow-x-auto rounded-2xl ring-1 ring-slate-100">
              <table className="w-full text-left text-sm table-fixed">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                    <th className="w-1/4 px-4 py-3">Tanggal</th>
                    <th className="w-1/4 px-4 py-3">Kategori</th>
                    <th className="w-1/4 px-4 py-3 text-right">Nominal</th>
                    <th className="w-1/4 px-4 py-3">Keterangan</th>
                  </tr>
                </thead>
                <tbody>
                  {summaryPengeluaran.map((it, i) => (
                    <tr key={i} className="border-b border-slate-100 last:border-0">
                      <td className="w-1/4 px-4 py-2 text-slate-600">{formatTanggal(it.tanggal)}</td>
                      <td className="w-1/4 px-4 py-2 font-medium text-slate-900">{it.kategori_pengeluaran}</td>
                      <td className="w-1/4 px-4 py-2 text-right text-red-600">{formatRupiah(it.nominal)}</td>
                      <td className="w-1/4 px-4 py-2 text-slate-600">{it.keterangan || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Laporan" description="Lihat dan ekspor laporan keuangan RT 26" />

      <Tabs tabs={tabs} value={activeTab} onChange={setActiveTab} className="mb-4" />

      <Card>
        <div className="border-b border-slate-100 p-4">
          <div className="flex flex-wrap items-end gap-2">
            <div>
              <label className="mb-1 ml-4 block text-xs font-medium text-slate-500">Bulan</label>
              <select
                className={toolbarFieldClass}
                value={filterBulan}
                onChange={(e) => setFilterBulan(e.target.value)}
              >
                <option value="">Semua Bulan</option>
                {months.slice(1).map((m, i) => (
                  <option key={i + 1} value={i + 1}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 ml-4 block text-xs font-medium text-slate-500">Tahun</label>
              <select
                className={toolbarFieldClass}
                value={filterTahun}
                onChange={(e) => setFilterTahun(e.target.value)}
              >
                <option value="">Semua Tahun</option>
                {Array.from({ length: 5 }, (_, i) => currentYear - i).map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            {activeTab === 'iuran' && (
              <div>
                <label className="mb-1 ml-4 block text-xs font-medium text-slate-500">Jenis Iuran</label>
                <select
                  className={toolbarFieldClass}
                  value={filterJenisIuran}
                  onChange={(e) => setFilterJenisIuran(e.target.value)}
                >
                  <option value="">Semua Jenis</option>
                  {jenisIuranList.map((j) => (
                    <option key={j.id} value={j.id}>{j.nama}</option>
                  ))}
                </select>
              </div>
            )}
            {activeTab === 'pengeluaran' && (
              <div>
                <label className="mb-1 ml-4 block text-xs font-medium text-slate-500">Kategori</label>
                <select
                  className={toolbarFieldClass}
                  value={filterKategori}
                  onChange={(e) => setFilterKategori(e.target.value)}
                >
                  <option value="">Semua Kategori</option>
                  {kategoriList.map((k) => (
                    <option key={k.id} value={k.id}>{k.nama}</option>
                  ))}
                </select>
              </div>
            )}

            {activeTab !== 'keuangan' && can('laporan:export') && (
              <div className="ml-auto flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={!!exporting}
                  onClick={() => handleExport(`${activeTab}-pdf`)}
                >
                  {exporting === `${activeTab}-pdf` ? 'Download...' : 'Export PDF'}
                </Button>
                <Button
                  size="sm"
                  disabled={!!exporting}
                  onClick={() => handleExport(`${activeTab}-excel`)}
                >
                  {exporting === `${activeTab}-excel` ? 'Download...' : 'Export Excel'}
                </Button>
              </div>
            )}
          </div>
        </div>

        {error && <div className="p-4 text-sm text-red-600">{error}</div>}
        {loading ? (
          activeTab === 'keuangan' ? (
            <TableSkeleton rows={4} cols={3} />
          ) : (
            <TableSkeleton cols={5} />
          )
        ) : activeTab === 'keuangan' ? (
          renderKeuangan()
        ) : data.length === 0 ? (
          <EmptyState message="Belum ada data laporan untuk periode ini." />
        ) : (
          <div className="overflow-x-auto">
            {activeTab === 'kas' && renderKasTable()}
            {activeTab === 'iuran' && renderIuranTable()}
            {activeTab === 'pengeluaran' && renderPengeluaranTable()}
          </div>
        )}
      </Card>
    </div>
  )
}
