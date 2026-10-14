import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { kkApi, exportApi } from '../../api/index.js'
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
  rowLinkClass,
  toolbarClass,
  toolbarSearchClass,
} from '../../components/ui.jsx'
import { PermissionGate } from '../../components/ProtectedRoute.jsx'
import { errorMessage } from '../../api/client.js'
import { useAuth } from '../../auth/AuthContext.jsx'

export default function KKList() {
  const { can } = useAuth()

  const [data, setData] = useState(() => ({ data: [], pagination: {} }))
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [error, setError] = useState('')
  const [toDelete, setToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [printing, setPrinting] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    kkApi
      .list({ search: search || undefined, page, limit: 10 })
      .then((res) => setData(res ?? { data: [], pagination: {} }))
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false))
  }, [search, page])

  useEffect(() => {
    load()
  }, [load])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await kkApi.remove(toDelete.id)
      toast.success('Kartu keluarga berhasil dihapus')
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

  const handlePrint = async () => {
    setPrinting(true)
    try {
      await exportApi.kkPdf()
      toast.success('PDF data Kartu Keluarga berhasil diunduh')
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setPrinting(false)
    }
  }

  return (
    <div>
      <PageHeader title="Kartu Keluarga" description="Daftar Kartu Keluarga warga RT 26">
        <div className="flex gap-2">
          {can('kartu-keluarga:export') && (
            <Button variant="secondary" size="sm" disabled={printing} onClick={handlePrint}>
              {printing ? 'Menyiapkan PDF...' : 'Cetak PDF'}
            </Button>
          )}
          <PermissionGate permission="kartu-keluarga:create">
            <Link to="/kartu-keluarga/baru">
              <Button>Tambah KK</Button>
            </Link>
          </PermissionGate>
        </div>
      </PageHeader>

      <Card>
        <div className="border-b border-slate-100 p-4">
          <form onSubmit={submitSearch} className={toolbarClass}>
            <input
              className={toolbarSearchClass}
              placeholder="Cari nomor KK, nama/NIK warga, alamat..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button variant="secondary" type="submit">
              Cari
            </Button>
          </form>
        </div>

        {error && <div className="p-4 text-sm text-red-600">{error}</div>}
        {loading ? (
          <TableSkeleton cols={6} />
        ) : data.data.length === 0 ? (
          <EmptyState message="Belum ada data KK." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                    <th className="px-4 py-3">No. KK</th>
                    <th className="px-4 py-3">Kepala Keluarga</th>
                    <th className="px-4 py-3">Alamat</th>
                    <th className="px-4 py-3 text-center">RT/RW</th>
                    <th className="px-4 py-3 text-center">Anggota</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((kk) => (
                    <tr key={kk.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">{kk.nomor_kk}</td>
                      <td className="px-4 py-3">
                        {kk.nama_kepala_keluarga || <span className="text-slate-400">-</span>}
                        {kk.anggota_cocok && (
                          <div className="mt-0.5 text-xs text-emerald-700">
                            Anggota: {kk.anggota_cocok}
                          </div>
                        )}
                      </td>
                      <td className="max-w-[220px] truncate px-4 py-3 text-slate-600">
                        {kk.alamat}
                      </td>
                      <td className="px-4 py-3 text-center text-slate-600">
                        {kk.rt}/{kk.rw}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge color="blue">{kk.jumlah_anggota} org</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/kartu-keluarga/${kk.id}`} className={rowLinkClass}>Detail</Link>
                          <ActionMenu
                            items={[
                              can('kartu-keluarga:update') && { label: 'Ubah', to: `/kartu-keluarga/${kk.id}/edit` },
                              can('kartu-keluarga:delete') && { label: 'Hapus', onClick: () => setToDelete(kk), danger: true },
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
        title="Hapus KK"
        message={`Yakin ingin menghapus KK nomor ${toDelete ? toDelete.nomor_kk : ''}?`}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
        loading={deleting}
      />
    </div>
  )
}
