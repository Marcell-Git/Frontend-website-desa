import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { auditLogApi } from '../../api/index.js'
import {
  Badge,
  Button,
  Card,
  EmptyState,
  PageHeader,
  Pagination,
  TableSkeleton,
  inputClass,
} from '../../components/ui.jsx'
import { errorMessage } from '../../api/client.js'

const modulOptions = [
  '', 'Authentication', 'Backup Database', 'Jenis Iuran', 'Kategori Pengeluaran', 'Master Data',
  'Pengumuman', 'Pengaduan', 'Rekap Iuran', 'Rekap Kas', 'Rekap Pengeluaran',
  'Role Management', 'User Management', 'Website Settings',
]

const aktivitasOptions = [
  '', 'Gagal Login', 'Login', 'Logout', 'Tambah Anak Kos', 'Tambah Iuran',
  'Tambah Jenis Iuran', 'Tambah KK', 'Tambah Kas', 'Tambah Kategori',
  'Tambah Pengeluaran', 'Tambah Pengumuman', 'Ubah KK', 'Ubah Pengumuman',
  'Buat Backup', 'Unduh Backup', 'Restore Database', 'Hapus Backup',
]

export default function AuditLogList() {
  const [data, setData] = useState({ data: [], pagination: {} })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [error, setError] = useState('')
  const [filterModul, setFilterModul] = useState('')
  const [filterAktivitas, setFilterAktivitas] = useState('')
  const [filterTanggalMulai, setFilterTanggalMulai] = useState('')
  const [filterTanggalAkhir, setFilterTanggalAkhir] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    const params = { search: search || undefined, page, limit: 15 }
    if (filterModul) params.modul = filterModul
    if (filterAktivitas) params.aktivitas = filterAktivitas
    if (filterTanggalMulai) params.tanggal_mulai = filterTanggalMulai
    if (filterTanggalAkhir) params.tanggal_akhir = filterTanggalAkhir
    auditLogApi
      .list(params)
      .then((res) => setData(res))
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false))
  }, [search, page, filterModul, filterAktivitas, filterTanggalMulai, filterTanggalAkhir])

  useEffect(() => {
    load()
  }, [load])

  const submitSearch = (e) => {
    e.preventDefault()
    setPage(1)
  }

  const aktivitasBadge = (akt) => {
    const map = {
      create: 'green',
      update: 'blue',
      delete: 'red',
      login: 'green',
      logout: 'slate',
      change_status: 'amber',
      add_catatan: 'blue',
    }
    return <Badge color={map[akt] || 'slate'}>{akt}</Badge>
  }

  return (
    <div>
      <PageHeader title="Audit Log" description="Riwayat seluruh aktivitas sistem" />

      <Card>
        <div className="border-b border-slate-200 p-4">
          <form onSubmit={submitSearch} className="flex flex-wrap gap-2">
            <input
              className={`${inputClass} max-w-xs`}
              placeholder="Cari user, modul, aktivitas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button variant="secondary" type="submit">Cari</Button>
          </form>
          <div className="mt-2 flex flex-wrap gap-2">
            <select
              className={`${inputClass} max-w-xs`}
              value={filterModul}
              onChange={(e) => { setFilterModul(e.target.value); setPage(1) }}
            >
              <option value="">Semua Modul</option>
              {modulOptions.filter(Boolean).map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <select
              className={`${inputClass} max-w-xs`}
              value={filterAktivitas}
              onChange={(e) => { setFilterAktivitas(e.target.value); setPage(1) }}
            >
              <option value="">Semua Aktivitas</option>
              {aktivitasOptions.filter(Boolean).map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
            <input
              type="date"
              className={`${inputClass} max-w-xs`}
              value={filterTanggalMulai}
              onChange={(e) => { setFilterTanggalMulai(e.target.value); setPage(1) }}
              placeholder="Dari tanggal"
            />
            <input
              type="date"
              className={`${inputClass} max-w-xs`}
              value={filterTanggalAkhir}
              onChange={(e) => { setFilterTanggalAkhir(e.target.value); setPage(1) }}
              placeholder="Sampai tanggal"
            />
          </div>
        </div>

        {error && <div className="p-4 text-sm text-red-600">{error}</div>}
        {loading ? (
          <TableSkeleton rows={15} cols={7} />
        ) : data.data.length === 0 ? (
          <EmptyState message="Belum ada audit log." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                    <th className="px-4 py-3">Waktu</th>
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Modul</th>
                    <th className="px-4 py-3">Aktivitas</th>
                    <th className="px-4 py-3">Deskripsi</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((item) => (
                    <tr key={item.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                      <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                        {new Date(item.created_at).toLocaleString('id-ID', {
                          day: '2-digit', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {item.nama_user || <span className="text-slate-400">-</span>}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {item.role_user || <span className="text-slate-400">-</span>}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{item.modul}</td>
                      <td className="px-4 py-3">{aktivitasBadge(item.aktivitas)}</td>
                      <td className="max-w-[250px] truncate px-4 py-3 text-slate-600">
                        {item.deskripsi || <span className="text-slate-400">-</span>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end">
                          <Link
                            to={`/audit-log/${item.id}`}
                            className="rounded-lg px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
                          >
                            Detail
                          </Link>
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
    </div>
  )
}
