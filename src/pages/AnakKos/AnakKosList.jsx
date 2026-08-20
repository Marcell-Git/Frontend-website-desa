import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { anakKosApi } from '../../api/index.js'
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

export default function AnakKosList() {
  const { can } = useAuth()

  const [data, setData] = useState({ data: [], pagination: {} })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [jkFilter, setJkFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [error, setError] = useState('')
  const [toDelete, setToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    anakKosApi
      .list({
        search: search || undefined,
        jenis_kelamin: jkFilter || undefined,
        status: statusFilter || undefined,
        page,
        limit: 10,
      })
      .then((res) => setData(res))
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false))
  }, [search, jkFilter, statusFilter, page])

  useEffect(() => {
    load()
  }, [load])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await anakKosApi.remove(toDelete.id)
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

  const formatTanggal = (t) => {
    if (!t) return '-'
    const d = new Date(t)
    return d.toLocaleDateString('id-ID')
  }

  return (
    <div>
      <PageHeader title="Anak Kos" description="Daftar seluruh data anak kos di wilayah RT 26">
        <PermissionGate permission="anak-kos:create">
          <Link to="/anak-kos/baru">
            <Button>Tambah Anak Kos</Button>
          </Link>
        </PermissionGate>
      </PageHeader>

      <Card>
        <div className="border-b border-slate-200 p-4">
          <form onSubmit={submitSearch} className="flex flex-wrap gap-2">
            <input
              className={`${inputClass} max-w-xs`}
              placeholder="Cari NIK, nama, pekerjaan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className={`${inputClass} max-w-xs`}
              value={jkFilter}
              onChange={(e) => {
                setJkFilter(e.target.value)
                setPage(1)
              }}
            >
              <option value="">Semua Jenis Kelamin</option>
              <option value="L">Laki-laki</option>
              <option value="P">Perempuan</option>
            </select>
            <select
              className={`${inputClass} max-w-xs`}
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPage(1)
              }}
            >
              <option value="">Semua Status</option>
              <option value="true">Aktif</option>
              <option value="false">Nonaktif</option>
            </select>
            <Button variant="secondary" type="submit">
              Cari
            </Button>
          </form>
        </div>

        {error && <div className="p-4 text-sm text-red-600">{error}</div>}
        {loading ? (
          <Spinner />
        ) : data.data.length === 0 ? (
          <EmptyState message="Belum ada data anak kos." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                    <th className="px-4 py-3">Nama</th>
                    <th className="px-4 py-3">NIK</th>
                    <th className="px-4 py-3">Tanggal Lahir</th>
                    <th className="px-4 py-3">Jenis Kelamin</th>
                    <th className="px-4 py-3">Agama</th>
                    <th className="px-4 py-3">Pekerjaan</th>
                    <th className="px-4 py-3">No. HP</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((a) => (
                    <tr key={a.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">{a.nama_lengkap}</td>
                      <td className="px-4 py-3 text-slate-600">{a.nik}</td>
                      <td className="px-4 py-3 text-slate-600">{formatTanggal(a.tanggal_lahir)}</td>
                      <td className="px-4 py-3 text-slate-600">{a.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</td>
                      <td className="px-4 py-3 text-slate-600">{a.agama}</td>
                      <td className="px-4 py-3 text-slate-600">{a.pekerjaan || '-'}</td>
                      <td className="px-4 py-3 text-slate-600">{a.nomor_hp || '-'}</td>
                      <td className="px-4 py-3">
                        {a.status ? <Badge color="green">Aktif</Badge> : <Badge color="red">Nonaktif</Badge>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          {can('anak-kos:update') && (
                            <Link
                              to={`/anak-kos/${a.id}/edit`}
                              className="rounded-lg px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
                            >
                              Ubah
                            </Link>
                          )}
                          {can('anak-kos:delete') && (
                            <button
                              onClick={() => setToDelete(a)}
                              className="rounded-lg px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
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
        title="Hapus Anak Kos"
        message={`Yakin ingin menghapus ${toDelete ? toDelete.nama_lengkap : ''}?`}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
        loading={deleting}
      />
    </div>
  )
}
