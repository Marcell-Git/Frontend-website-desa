import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { beritaKegiatanApi } from '../../api/index.js'
import { ActionMenu, Button, Card, ConfirmModal, EmptyState, PageHeader, Pagination, TableSkeleton, toolbarClass, toolbarFieldClass, toolbarSearchClass } from '../../components/ui.jsx'
import { PermissionGate } from '../../components/ProtectedRoute.jsx'
import { useAuth } from '../../auth/AuthContext.jsx'
import { errorMessage } from '../../api/client.js'
import { tanggalIndo, getContrastTextColor } from '../LandingPage/format.js'

export default function BeritaKegiatanList() {
  const { can } = useAuth()
  const [data, setData] = useState({ data: [], pagination: {} })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [kategori, setKategori] = useState('')
  const [page, setPage] = useState(1)
  const [error, setError] = useState('')
  const [toDelete, setToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    beritaKegiatanApi.list({ search: search || undefined, kategori: kategori || undefined, page, limit: 10 })
      .then(setData)
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false))
  }, [search, kategori, page])

  useEffect(() => { load() }, [load])

  const remove = async () => {
    setDeleting(true)
    try {
      await beritaKegiatanApi.remove(toDelete.id)
      toast.success('Berita atau kegiatan berhasil dihapus')
      setToDelete(null)
      load()
    } catch (err) {
      toast.error(errorMessage(err))
    } finally { setDeleting(false) }
  }

  return (
    <div>
      <PageHeader title="Berita & Kegiatan" description="Kelola informasi berita dan kegiatan untuk warga.">
        <PermissionGate permission="berita-kegiatan:create"><Link to="/kelola-berita-kegiatan/baru"><Button>Tambah</Button></Link></PermissionGate>
      </PageHeader>
      <Card>
        <form onSubmit={(e) => { e.preventDefault(); setPage(1) }} className={`${toolbarClass} border-b border-slate-100 p-4`}>
          <input className={toolbarSearchClass} value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari judul, lokasi..." />
          <input className={toolbarFieldClass} value={kategori} onChange={(e) => { setKategori(e.target.value); setPage(1) }} placeholder="Filter kategori" />
          <Button type="submit" variant="secondary">Cari</Button>
        </form>
        {error && <p className="p-4 text-sm text-red-600">{error}</p>}
        {loading ? <TableSkeleton cols={5} /> : data.data.length === 0 ? <EmptyState message="Belum ada berita atau kegiatan." /> : (
          <>
            <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b border-slate-200 text-xs uppercase text-slate-500"><th className="px-4 py-3">Kategori / Judul</th><th className="px-4 py-3">Tanggal & Jam</th><th className="px-4 py-3">Lokasi</th><th className="px-4 py-3">Dibuat Oleh</th><th className="px-4 py-3 text-right">Aksi</th></tr></thead><tbody>
              {data.data.map((item) => (
                <tr key={item.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <span
                      className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold shadow-xs"
                      style={{
                        backgroundColor: item.warna_label || '#047857',
                        color: getContrastTextColor(item.warna_label || '#047857'),
                      }}
                    >
                      {item.kategori}
                    </span>
                    <p className="mt-1 font-medium text-slate-900">{item.judul}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {tanggalIndo(item.tanggal)}
                    <br />
                    {item.jam}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{item.lokasi}</td>
                  <td className="px-4 py-3 text-slate-600">{item.nama_user || '-'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <ActionMenu
                        items={[
                          can('berita-kegiatan:update') && { label: 'Ubah', to: `/kelola-berita-kegiatan/${item.id}/edit` },
                          can('berita-kegiatan:delete') && { label: 'Hapus', onClick: () => setToDelete(item), danger: true },
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
      <ConfirmModal open={Boolean(toDelete)} title="Hapus berita atau kegiatan?" message={`“${toDelete?.judul || ''}” akan dihapus.`} onConfirm={remove} onCancel={() => setToDelete(null)} loading={deleting} />
    </div>
  )
}
