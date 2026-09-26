import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { peraturanApi } from '../../api/index.js'
import { assetUrl } from '../../api/config.js'
import { Button, Card, ConfirmModal, EmptyState, PageHeader, Pagination, TableSkeleton, inputClass } from '../../components/ui.jsx'
import { PermissionGate } from '../../components/ProtectedRoute.jsx'
import { useAuth } from '../../auth/AuthContext.jsx'
import { errorMessage } from '../../api/client.js'

function formatDate(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(date)
}

export default function PeraturanList() {
  const { can } = useAuth()
  const [data, setData] = useState({ data: [], pagination: {} })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [error, setError] = useState('')
  const [toDelete, setToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    peraturanApi.list({ search: search || undefined, page, limit: 10 })
      .then(setData)
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false))
  }, [search, page])

  useEffect(() => { load() }, [load])

  const remove = async () => {
    setDeleting(true)
    try {
      await peraturanApi.remove(toDelete.id)
      toast.success('Peraturan berhasil dihapus')
      setToDelete(null)
      load()
    } catch (err) {
      toast.error(errorMessage(err))
    } finally { setDeleting(false) }
  }

  return (
    <div>
      <PageHeader title="Peraturan RT" description="Kelola dokumen peraturan yang dapat dibaca warga.">
        <PermissionGate permission="peraturan:create">
          <Link to="/kelola-peraturan/baru"><Button>Tambah</Button></Link>
        </PermissionGate>
      </PageHeader>
      <Card>
        <form onSubmit={(e) => { e.preventDefault(); setPage(1) }} className="flex flex-wrap gap-2 border-b border-slate-200 p-4">
          <input className={`${inputClass} max-w-xs`} value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari judul peraturan..." />
          <Button type="submit" variant="secondary">Cari</Button>
        </form>
        {error && <p className="p-4 text-sm text-red-600">{error}</p>}
        {loading ? <TableSkeleton cols={3} /> : data.data.length === 0 ? <EmptyState message="Belum ada peraturan." /> : (
          <>
            <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b border-slate-200 text-xs uppercase text-slate-500"><th className="px-4 py-3">Judul</th><th className="px-4 py-3">Tanggal Upload</th><th className="px-4 py-3 text-right">Aksi</th></tr></thead><tbody>
              {data.data.map((item) => (
                <tr key={item.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">{item.judul}</p>
                    {item.nama_user && <p className="mt-0.5 text-xs text-slate-400">oleh {item.nama_user}</p>}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{formatDate(item.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <a
                        href={assetUrl(item.file_pdf)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
                      >
                        Buka
                      </a>
                      {can('peraturan:update') && (
                        <Link
                          to={`/kelola-peraturan/${item.id}/edit`}
                          className="rounded-lg px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
                        >
                          Ubah
                        </Link>
                      )}
                      {can('peraturan:delete') && (
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
            </tbody></table></div>
            <Pagination page={data.pagination.page} totalPage={data.pagination.total_page} onChange={setPage} />
          </>
        )}
      </Card>
      <ConfirmModal
        open={Boolean(toDelete)}
        title="Hapus peraturan?"
        message={`“${toDelete?.judul || ''}” akan dihapus beserta file PDF-nya.`}
        onConfirm={remove}
        onCancel={() => setToDelete(null)}
        loading={deleting}
      />
    </div>
  )
}
