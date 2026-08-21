import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { kasApi } from '../../api/index.js'
import {
  Badge,
  Button,
  Card,
  ConfirmModal,
  EmptyState,
  PageHeader,
  Pagination,
  Spinner,
  inputClass,
} from '../../components/ui.jsx'
import { PermissionGate } from '../../components/ProtectedRoute.jsx'
import { errorMessage } from '../../api/client.js'
import { useAuth } from '../../auth/AuthContext.jsx'

const formatRupiah = (n) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)

const months = [
  '', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

export default function KasList() {
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
      setToDelete(null)
      load()
    } catch (err) {
      alert(errorMessage(err))
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
      <PageHeader title="Rekap Kas" description="Daftar transaksi kas RT 26">
        <PermissionGate permission="kas:create">
          <Link to="/kas/baru">
            <Button>Tambah Transaksi</Button>
          </Link>
        </PermissionGate>
      </PageHeader>

      <Card>
        <div className="border-b border-slate-200 p-4">
          <form onSubmit={submitSearch} className="flex flex-wrap gap-2">
            <input
              className={`${inputClass} max-w-xs`}
              placeholder="Cari sumber kas, keterangan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button variant="secondary" type="submit">
              Cari
            </Button>
            <select
              className={`${inputClass} max-w-xs`}
              value={filterBulan}
              onChange={(e) => { setFilterBulan(e.target.value); setPage(1) }}
            >
              <option value="">Semua Bulan</option>
              {months.slice(1).map((m, i) => (
                <option key={i + 1} value={i + 1}>{m}</option>
              ))}
            </select>
            <select
              className={`${inputClass} max-w-xs`}
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
          <Spinner />
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
                        {new Date(item.tanggal).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-900">{item.sumber_kas}</td>
                      <td className="max-w-[200px] truncate px-4 py-3 text-slate-600">
                        {item.keterangan || <span className="text-slate-400">-</span>}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-emerald-700">
                        {formatRupiah(item.nominal)}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{item.nama_user}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          {can('kas:update') && (
                            <Link
                              to={`/kas/${item.id}/edit`}
                              className="rounded-lg px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
                            >
                              Ubah
                            </Link>
                          )}
                          {can('kas:delete') && (
                            <button
                              onClick={() => setToDelete(item)}
                              className="rounded-lg px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                            >
                              Hapus
                            </button>
                          )}
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
