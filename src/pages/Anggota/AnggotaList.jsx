import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { anggotaApi, kkApi } from '../../api/index.js'
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

export default function AnggotaList() {
  const { can } = useAuth()
  const navigate = useNavigate()

  const [data, setData] = useState({ data: [], pagination: {} })
  const [kkOptions, setKkOptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [kkFilter, setKkFilter] = useState('')
  const [page, setPage] = useState(1)
  const [error, setError] = useState('')
  const [toDelete, setToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    anggotaApi
      .list({
        search: search || undefined,
        kartu_keluarga_id: kkFilter || undefined,
        page,
        limit: 10,
      })
      .then((res) => setData(res))
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false))
  }, [search, kkFilter, page])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    kkApi
      .list({ limit: 100 })
      .then((res) => setKkOptions(res.data))
      .catch(() => {})
  }, [])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await anggotaApi.remove(toDelete.id)
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
    load()
  }

  const formatTanggal = (t) => {
    if (!t) return '-'
    const d = new Date(t)
    return d.toLocaleDateString('id-ID')
  }

  return (
    <div>
      <PageHeader title="Anggota Keluarga" description="Daftar seluruh anggota keluarga warga RT 26">
        <PermissionGate permission="anggota:create">
          <Link to="/anggota/baru">
            <Button>Tambah Anggota</Button>
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
              value={kkFilter}
              onChange={(e) => {
                setKkFilter(e.target.value)
                setPage(1)
              }}
            >
              <option value="">Semua KK</option>
              {kkOptions.map((kk) => (
                <option key={kk.id} value={kk.id}>
                  {kk.nomor_kk} - {kk.nama_kepala_keluarga || ''}
                </option>
              ))}
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
          <EmptyState message="Belum ada data anggota." />
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
                    <th className="px-4 py-3">Hubungan</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((a) => (
                    <tr key={a.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <button
                          onClick={() => navigate(`/kartu-keluarga/${a.kartu_keluarga_id}`)}
                          className="font-medium text-slate-900 hover:text-emerald-700"
                          title="Lihat KK"
                        >
                          {a.nama_lengkap}
                        </button>
                        <div className="text-xs text-slate-400">KK: {a.kartu_keluarga_id.slice(0, 8)}...</div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{a.nik}</td>
                      <td className="px-4 py-3 text-slate-600">{formatTanggal(a.tanggal_lahir)}</td>
                      <td className="px-4 py-3 text-slate-600">{a.jenis_kelamin}</td>
                      <td className="px-4 py-3">
                        {a.hubungan_keluarga === 'Kepala Keluarga' ? (
                          <Badge color="green">Kepala Keluarga</Badge>
                        ) : (
                          <span className="text-slate-600">{a.hubungan_keluarga}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {a.status ? <Badge color="green">Aktif</Badge> : <Badge color="red">Nonaktif</Badge>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          {can('anggota:update') && (
                            <Link
                              to={`/anggota/${a.id}/edit`}
                              className="rounded-lg px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
                            >
                              Ubah
                            </Link>
                          )}
                          {a.hubungan_keluarga !== 'Kepala Keluarga' && (
                            <Link
                              to={`/anggota/${a.id}/pindah`}
                              className="rounded-lg px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
                            >
                              Pindah
                            </Link>
                          )}
                          {can('anggota:delete') && a.hubungan_keluarga !== 'Kepala Keluarga' && (
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
        title="Hapus Anggota"
        message={`Yakin ingin menghapus ${toDelete ? toDelete.nama_lengkap : ''}?`}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
        loading={deleting}
      />
    </div>
  )
}
