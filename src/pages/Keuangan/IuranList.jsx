import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { exportApi, iuranApi, jenisIuranApi } from '../../api/index.js'
import {
  ActionMenu,
  Badge,
  Button,
  Card,
  ConfirmModal,
  EmptyState,
  PageHeader,
  Pagination,
  TableSkeleton,
  Tabs,
  toolbarClass,
  toolbarFieldClass,
  toolbarSearchClass,
} from '../../components/ui.jsx'
import { PermissionGate } from '../../components/ProtectedRoute.jsx'
import { errorMessage } from '../../api/client.js'
import { useAuth } from '../../auth/AuthContext.jsx'
import { formatTanggal } from '../../lib/tanggal.js'
import PembayaranBulanan, { PeriodePicker, periodeSekarang } from '../../components/PembayaranBulanan.jsx'
import { labelBerlaku } from './jenisIuran.js'

const formatRupiah = (n) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)

const months = [
  '', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

const tabs = [
  { key: 'pembayaran', label: 'Pembayaran Bulanan' },
  { key: 'transaksi', label: 'Semua Transaksi' },
]

function IuranPembayaran() {
  const [periode, setPeriode] = useState(periodeSekarang())
  const [jenisList, setJenisList] = useState(null)
  const [jenisId, setJenisId] = useState('')

  useEffect(() => {
    setJenisList(null)
    jenisIuranApi
      .list({ limit: 100, aktif_periode: periode })
      .then((res) => {
        const list = res.data || []
        setJenisList(list)
        setJenisId((cur) => (list.some((j) => j.id === cur) ? cur : list[0]?.id || ''))
      })
      .catch((err) => {
        setJenisList([])
        toast.error(errorMessage(err))
      })
  }, [periode])

  const jenis = jenisList?.find((j) => j.id === jenisId)
  const fetchList = useCallback(
    (params) => iuranApi.pembayaran({ ...params, jenis_iuran_id: jenisId }),
    [jenisId],
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <PeriodePicker value={periode} onChange={setPeriode} />
        {jenisList && jenisList.length > 0 && (
          <select
            className={toolbarFieldClass}
            value={jenisId}
            onChange={(e) => setJenisId(e.target.value)}
            aria-label="Jenis iuran"
          >
            {jenisList.map((j) => (
              <option key={j.id} value={j.id}>{j.nama}</option>
            ))}
          </select>
        )}
        {jenis && (
          <span className="text-sm text-slate-500">
            <span className="font-semibold text-slate-900">{formatRupiah(jenis.nominal)}</span> per KK / bulan · {labelBerlaku(jenis)}
          </span>
        )}
      </div>

      {jenisList === null ? (
        <Card><TableSkeleton cols={5} /></Card>
      ) : jenisList.length === 0 ? (
        <Card>
          <EmptyState message="Tidak ada iuran yang berlaku pada bulan ini. Tambahkan atau atur nominal & periode di menu Jenis Iuran." />
        </Card>
      ) : (
        jenis && (
          <PembayaranBulanan
            key={jenisId}
            periode={periode}
            namaTagihan={jenis.nama}
            permissionPrefix="iuran"
            fetchList={fetchList}
            konfirmasi={(body) => iuranApi.konfirmasi({ ...body, jenis_iuran_id: jenisId })}
            batal={iuranApi.batalKonfirmasi}
            exportPdf={() => exportApi.pembayaranIuranPdf(periode, jenisId)}
            exportExcel={() => exportApi.pembayaranIuranExcel(periode, jenisId)}
          />
        )
      )}
    </div>
  )
}

export default function IuranList() {
  const [tab, setTab] = useState('pembayaran')

  return (
    <div>
      <PageHeader title="Rekap Iuran" description="Pembayaran iuran bulanan per kepala keluarga dan transaksi iuran RT 26">
        {tab === 'transaksi' && (
          <PermissionGate permission="iuran:create">
            <Link to="/iuran/baru">
              <Button>Tambah Transaksi</Button>
            </Link>
          </PermissionGate>
        )}
      </PageHeader>
      <Tabs tabs={tabs} value={tab} onChange={setTab} className="mb-4" />
      {tab === 'pembayaran' ? <IuranPembayaran /> : <IuranTransaksi />}
    </div>
  )
}

function IuranTransaksi() {
  const { can } = useAuth()
  const [data, setData] = useState({ data: [], pagination: {} })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [error, setError] = useState('')
  const [toDelete, setToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [filterBulan, setFilterBulan] = useState('')
  const [filterTahun, setFilterTahun] = useState('')
  const [filterJenis, setFilterJenis] = useState('')
  const [jenisOptions, setJenisOptions] = useState([])
  const currentYear = new Date().getFullYear()

  useEffect(() => {
    jenisIuranApi
      .list({ limit: 100 })
      .then((res) => setJenisOptions(res.data || []))
      .catch(() => {})
  }, [])

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    const params = { search: search || undefined, page, limit: 10 }
    if (filterBulan) params.bulan = filterBulan
    if (filterTahun) params.tahun = filterTahun
    if (filterJenis) params.jenis_iuran_id = filterJenis
    iuranApi
      .list(params)
      .then((res) => setData(res))
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false))
  }, [search, page, filterBulan, filterTahun, filterJenis])

  useEffect(() => {
    load()
  }, [load])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await iuranApi.remove(toDelete.id)
      toast.success('Iuran berhasil dihapus')
      setToDelete(null)
      load()
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setDeleting(false)
    }
  }

  const submitSearch = (e) => {
    e.preventDefault()
    setPage(1)
  }

  return (
    <div>
      <Card>
        <div className="border-b border-slate-100 p-4">
          <form onSubmit={submitSearch} className={toolbarClass}>
            <input
              className={toolbarSearchClass}
              placeholder="Cari jenis iuran, keterangan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button variant="secondary" type="submit">
              Cari
            </Button>
            <select
              className={toolbarFieldClass}
              value={filterJenis}
              onChange={(e) => { setFilterJenis(e.target.value); setPage(1) }}
            >
              <option value="">Semua Jenis</option>
              {jenisOptions.map((j) => (
                <option key={j.id} value={j.id}>{j.nama}</option>
              ))}
            </select>
            <select
              className={toolbarFieldClass}
              value={filterBulan}
              onChange={(e) => { setFilterBulan(e.target.value); setPage(1) }}
            >
              <option value="">Semua Bulan</option>
              {months.slice(1).map((m, i) => (
                <option key={i + 1} value={i + 1}>{m}</option>
              ))}
            </select>
            <select
              className={toolbarFieldClass}
              value={filterTahun}
              onChange={(e) => { setFilterTahun(e.target.value); setPage(1) }}
            >
              <option value="">Semua Tahun</option>
              {Array.from({ length: 5 }, (_, i) => currentYear - i).map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </form>
        </div>

        {error && <div className="p-4 text-sm text-red-600">{error}</div>}
        {loading ? (
          <TableSkeleton cols={6} />
        ) : data.data.length === 0 ? (
          <EmptyState message="Belum ada transaksi iuran." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                    <th className="px-4 py-3">Tanggal</th>
                    <th className="px-4 py-3">Jenis Iuran</th>
                    <th className="px-4 py-3">Keterangan</th>
                    <th className="px-4 py-3 text-right">Nominal</th>
                    <th className="px-4 py-3">Dibuat Oleh</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((item) => (
                    <tr key={item.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                      <td className="px-4 py-3 text-slate-600">
                        {formatTanggal(item.tanggal)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col items-start gap-1">
                          <Badge color="blue">{item.nama_jenis_iuran}</Badge>
                          {item.dari_pembayaran && <Badge color="green">Pembayaran bulanan</Badge>}
                        </div>
                      </td>
                      <td className="max-w-[200px] truncate px-4 py-3 text-slate-600">
                        {item.keterangan || <span className="text-slate-400">-</span>}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-emerald-700">
                        {formatRupiah(item.nominal)}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{item.nama_user}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <ActionMenu
                            items={[
                              can('iuran:update') && !item.dari_pembayaran && { label: 'Ubah', to: `/iuran/${item.id}/edit` },
                              can('iuran:delete') && !item.dari_pembayaran && { label: 'Hapus', onClick: () => setToDelete(item), danger: true },
                            ]}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              page={data.pagination.page}
              totalPage={data.pagination.total_page}
              onChange={setPage}
            />
          </>
        )}
      </Card>

      <ConfirmModal
        open={!!toDelete}
        title="Hapus Transaksi Iuran"
        message="Yakin ingin menghapus transaksi iuran ini?"
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
        loading={deleting}
      />
    </div>
  )
}
