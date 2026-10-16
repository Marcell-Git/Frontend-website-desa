import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { pengeluaranApi, kategoriPengeluaranApi } from '../../api/index.js'
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
  toolbarClass,
  toolbarFieldClass,
  toolbarSearchClass,
} from '../../components/ui.jsx'
import { PermissionGate } from '../../components/ProtectedRoute.jsx'
import { errorMessage } from '../../api/client.js'
import { useAuth } from '../../auth/AuthContext.jsx'
import { formatTanggal } from '../../lib/tanggal.js'

const formatRupiah = (n) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)

const months = [
  '', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

export default function PengeluaranList() {
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
  const [filterKategori, setFilterKategori] = useState('')
  const [kategoriOptions, setKategoriOptions] = useState([])
  const currentYear = new Date().getFullYear()

  useEffect(() => {
    kategoriPengeluaranApi
      .list({ limit: 100 })
      .then((res) => setKategoriOptions(res.data || []))
      .catch(() => {})
  }, [])

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    const params = { search: search || undefined, page, limit: 10 }
    if (filterBulan) params.bulan = filterBulan
    if (filterTahun) params.tahun = filterTahun
    if (filterKategori) params.kategori_pengeluaran_id = filterKategori
    pengeluaranApi
      .list(params)
      .then((res) => setData(res))
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false))
  }, [search, page, filterBulan, filterTahun, filterKategori])

  useEffect(() => {
    load()
  }, [load])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await pengeluaranApi.remove(toDelete.id)
      toast.success('Pengeluaran berhasil dihapus')
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
      <PageHeader title="Rekap Pengeluaran" description="Daftar pengeluaran RT 26">
        <PermissionGate permission="pengeluaran:create">
          <Link to="/pengeluaran/baru">
            <Button>Tambah Pengeluaran</Button>
          </Link>
        </PermissionGate>
      </PageHeader>

      <Card>
        <div className="border-b border-slate-100 p-4">
          <form onSubmit={submitSearch} className={toolbarClass}>
            <input
              className={toolbarSearchClass}
              placeholder="Cari kategori, keterangan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button variant="secondary" type="submit">
              Cari
            </Button>
            <select
              className={toolbarFieldClass}
              value={filterKategori}
              onChange={(e) => { setFilterKategori(e.target.value); setPage(1) }}
            >
              <option value="">Semua Kategori</option>
              {kategoriOptions.map((k) => (
                <option key={k.id} value={k.id}>{k.nama}</option>
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
          <EmptyState message="Belum ada data pengeluaran." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                    <th className="px-4 py-3">Tanggal</th>
                    <th className="px-4 py-3">Kategori</th>
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
                        <Badge color="orange">{item.nama_kategori_pengeluaran}</Badge>
                      </td>
                      <td className="max-w-[200px] truncate px-4 py-3 text-slate-600">
                        {item.keterangan || <span className="text-slate-400">-</span>}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-red-600">
                        {formatRupiah(item.nominal)}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{item.nama_user}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <ActionMenu
                            items={[
                              can('pengeluaran:update') && { label: 'Ubah', to: `/pengeluaran/${item.id}/edit` },
                              can('pengeluaran:delete') && { label: 'Hapus', onClick: () => setToDelete(item), danger: true },
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
        title="Hapus Pengeluaran"
        message="Yakin ingin menghapus pengeluaran ini?"
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
        loading={deleting}
      />
    </div>
  )
}
