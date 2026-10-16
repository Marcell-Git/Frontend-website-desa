import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { peraturanApi } from '../../api/index.js'
import { assetUrl } from '../../api/config.js'
import { ActionMenu, Button, Card, ConfirmModal, EmptyState, PageHeader, Pagination, TableSkeleton, rowLinkClass, toolbarClass, toolbarSearchClass } from '../../components/ui.jsx'
import { PermissionGate } from '../../components/ProtectedRoute.jsx'
import { useAuth } from '../../auth/AuthContext.jsx'
import { errorMessage } from '../../api/client.js'
import { formatTanggal } from '../../lib/tanggal.js'

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
        <form onSubmit={(e) => { e.preventDefault(); setPage(1) }} className={`${toolbarClass} border-b border-slate-100 p-4`}>
          <input className={toolbarSearchClass} value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari judul peraturan..." />
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
                  <td className="px-4 py-3 text-slate-600">{formatTanggal(item.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <a href={assetUrl(item.file_pdf)} target="_blank" rel="noopener noreferrer" className={rowLinkClass}>Buka</a>
                      <ActionMenu
                        items={[
                          can('peraturan:update') && { label: 'Ubah', to: `/kelola-peraturan/${item.id}/edit` },
                          can('peraturan:delete') && { label: 'Hapus', onClick: () => setToDelete(item), danger: true },
                        ]}
                      />
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
