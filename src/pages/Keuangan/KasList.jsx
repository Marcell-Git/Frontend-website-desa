import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { exportApi, kasApi } from '../../api/index.js'
import {
  ActionMenu,
  Badge,
  Button,
  Card,
  ConfirmModal,
  EmptyState,
  PageHeader,
  Pagination,
  Field,
  TableSkeleton,
  Tabs,
  inputClass,
  toolbarClass,
  toolbarFieldClass,
  toolbarSearchClass,
} from '../../components/ui.jsx'
import { PermissionGate } from '../../components/ProtectedRoute.jsx'
import { errorMessage } from '../../api/client.js'
import { useAuth } from '../../auth/AuthContext.jsx'
import { formatTanggal } from '../../lib/tanggal.js'
import PembayaranBulanan, { PeriodePicker, periodeSekarang } from '../../components/PembayaranBulanan.jsx'

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

function KasPembayaran() {
  const { can } = useAuth()
  const [periode, setPeriode] = useState(periodeSekarang())
  const [nominal, setNominal] = useState(null)
  const [editOpen, setEditOpen] = useState(false)
  const [nominalInput, setNominalInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    kasApi
      .pengaturan()
      .then((res) => setNominal(res?.nominal_bulanan ?? 0))
      .catch((err) => toast.error(errorMessage(err)))
  }, [])

  const simpanNominal = async () => {
    setSaving(true)
    try {
      await kasApi.updatePengaturan({ nominal_bulanan: Number(nominalInput) })
      setNominal(Number(nominalInput))
      setEditOpen(false)
      setReloadKey((k) => k + 1)
      toast.success('Nominal kas bulanan diperbarui')
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PeriodePicker value={periode} onChange={setPeriode} />
        {nominal !== null && (
          <div className="flex items-center gap-3 rounded-full bg-white py-1.5 pl-4 pr-1.5 text-sm shadow-sm ring-1 ring-black/5">
            <span className="text-slate-500">
              Kas per KK / bulan: <span className="font-semibold text-slate-900">{formatRupiah(nominal)}</span>
            </span>
            {can('kas:update') && (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  setNominalInput(nominal ? String(nominal) : '')
                  setEditOpen(true)
                }}
              >
                Ubah
              </Button>
            )}
          </div>
        )}
      </div>

      {nominal === 0 && (
        <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Nominal kas bulanan belum diatur. Atur nominal terlebih dahulu sebelum mengonfirmasi pembayaran.
        </div>
      )}

      <PembayaranBulanan
        key={reloadKey}
        periode={periode}
        namaTagihan="kas"
        permissionPrefix="kas"
        fetchList={kasApi.pembayaran}
        konfirmasi={kasApi.konfirmasi}
        batal={kasApi.batalKonfirmasi}
        exportPdf={() => exportApi.pembayaranKasPdf(periode)}
        exportExcel={() => exportApi.pembayaranKasExcel(periode)}
      />

      <ConfirmModal
        open={editOpen}
        title="Nominal Kas Bulanan"
        message="Nominal ini ditagihkan ke setiap kepala keluarga tiap bulan. Pembayaran yang sudah dikonfirmasi tidak berubah."
        onConfirm={simpanNominal}
        onCancel={() => setEditOpen(false)}
        loading={saving}
        confirmText="Simpan"
        danger={false}
      >
        <div className="mt-4">
          <Field label="Nominal (Rp)" required>
            <input
              type="number"
              min="1"
              className={inputClass}
              value={nominalInput}
              onChange={(e) => setNominalInput(e.target.value)}
              placeholder="Contoh: 10000"
            />
          </Field>
        </div>
      </ConfirmModal>
    </div>
  )
}

export default function KasList() {
  const [tab, setTab] = useState('pembayaran')

  return (
    <div>
      <PageHeader title="Rekap Kas" description="Pembayaran kas bulanan per kepala keluarga dan transaksi kas RT 26">
        {tab === 'transaksi' && (
          <PermissionGate permission="kas:create">
            <Link to="/kas/baru">
              <Button>Tambah Transaksi</Button>
            </Link>
          </PermissionGate>
        )}
      </PageHeader>
      <Tabs tabs={tabs} value={tab} onChange={setTab} className="mb-4" />
      {tab === 'pembayaran' ? <KasPembayaran /> : <KasTransaksi />}
    </div>
  )
}

function KasTransaksi() {
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
  const currentYear = new Date().getFullYear()

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    const params = { search: search || undefined, page, limit: 10 }
    if (filterBulan) params.bulan = filterBulan
    if (filterTahun) params.tahun = filterTahun
    kasApi
      .list(params)
      .then((res) => setData(res))
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false))
  }, [search, page, filterBulan, filterTahun])

  useEffect(() => {
    load()
  }, [load])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await kasApi.remove(toDelete.id)
      toast.success('Transaksi kas berhasil dihapus')
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
              placeholder="Cari sumber kas, keterangan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button variant="secondary" type="submit">
              Cari
            </Button>
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
          <EmptyState message="Belum ada transaksi kas." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                    <th className="px-4 py-3">Tanggal</th>
                    <th className="px-4 py-3">Sumber Kas</th>
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
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {item.sumber_kas}
                        {item.dari_pembayaran && (
                          <div className="mt-1">
                            <Badge color="blue">Pembayaran bulanan</Badge>
                          </div>
                        )}
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
                              can('kas:update') && !item.dari_pembayaran && { label: 'Ubah', to: `/kas/${item.id}/edit` },
                              can('kas:delete') && !item.dari_pembayaran && { label: 'Hapus', onClick: () => setToDelete(item), danger: true },
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
        title="Hapus Transaksi Kas"
        message={`Yakin ingin menghapus transaksi kas "${toDelete ? toDelete.sumber_kas : ''}"?`}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
        loading={deleting}
      />
    </div>
  )
}
