import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { pengaduanApi } from '../../api/index.js'
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

const months = [
  '', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

const statusColors = {
  menunggu: 'amber',
  diproses: 'blue',
  selesai: 'green',
}

const statusLabels = {
  menunggu: 'Menunggu',
  diproses: 'Diproses',
  selesai: 'Selesai',
}

export default function PengaduanList() {
  const [data, setData] = useState({ data: [], pagination: {} })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [error, setError] = useState('')
  const [toDelete, setToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [filterStatus, setFilterStatus] = useState('')
  const [filterBulan, setFilterBulan] = useState('')
  const [filterTahun, setFilterTahun] = useState('')
  const currentYear = new Date().getFullYear()

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    const params = { search: search || undefined, page, limit: 10 }
    if (filterStatus) params.status = filterStatus
    if (filterBulan) params.bulan = filterBulan
    if (filterTahun) params.tahun = filterTahun
    pengaduanApi
      .list(params)
      .then((res) => setData(res))
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false))
  }, [search, page, filterStatus, filterBulan, filterTahun])

  useEffect(() => {
    load()
  }, [load])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await pengaduanApi.remove(toDelete.id)
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
      <PageHeader title="Pengaduan" description="Kelola pengaduan dari warga" />

      <Card>
        <div className="border-b border-slate-200 p-4">
          <form onSubmit={submitSearch} className="flex flex-wrap gap-2">
            <input
              className={`${inputClass} max-w-xs`}
              placeholder="Cari nama pelapor, lokasi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button variant="secondary" type="submit">
              Cari
            </Button>
            <select
              className={`${inputClass} max-w-xs`}
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setPage(1) }}
            >
              <option value="">Semua Status</option>
              <option value="menunggu">Menunggu</option>
              <option value="diproses">Diproses</option>
              <option value="selesai">Selesai</option>
            </select>
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
          <EmptyState message="Belum ada pengaduan." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                    <th className="px-4 py-3">Pelapor</th>
                    <th className="px-4 py-3">Lokasi</th>
                    <th className="px-4 py-3">Tanggal</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((item) => (
                    <tr key={item.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">{item.nama_pelapor}</td>
                      <td className="px-4 py-3 text-slate-600">{item.lokasi}</td>
                      <td className="px-4 py-3 text-slate-600">
                        {new Date(item.created_at).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-4 py-3">
                        <Badge color={statusColors[item.status] || 'slate'}>
                          {statusLabels[item.status] || item.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <Link
                            to={`/kelola-pengaduan/${item.id}`}
                            className="rounded-lg px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
                          >
                            Detail
                          </Link>
                          <PermissionGate permission="pengaduan:delete">
                            <button
                              onClick={() => setToDelete(item)}
                              className="rounded-lg px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                            >
                              Hapus
                            </button>
                          </PermissionGate>
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
        title="Hapus Pengaduan"
        message={`Yakin ingin menghapus pengaduan dari "${toDelete ? toDelete.nama_pelapor : ''}"?`}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
        loading={deleting}
      />
    </div>
  )
}
