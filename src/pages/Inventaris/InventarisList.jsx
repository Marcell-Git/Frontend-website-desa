import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { inventarisApi } from '../../api/index.js'
import { ActionMenu, Button, Card, ConfirmModal, EmptyState, PageHeader, Pagination, TableSkeleton, rowLinkClass, toolbarClass, toolbarFieldClass, toolbarSearchClass } from '../../components/ui.jsx'
import { PermissionGate } from '../../components/ProtectedRoute.jsx'
import { useAuth } from '../../auth/AuthContext.jsx'
import { errorMessage } from '../../api/client.js'
import { getContrastTextColor } from '../LandingPage/format.js'
import { KONDISI_META, KONDISI_OPTIONS } from './constants.js'

export default function InventarisList() {
  const { can } = useAuth()
  const [data, setData] = useState({ data: [], pagination: {} })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [kategori, setKategori] = useState('')
  const [kondisi, setKondisi] = useState('')
  const [page, setPage] = useState(1)
  const [error, setError] = useState('')
  const [toDelete, setToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    inventarisApi.list({ search: search || undefined, kategori: kategori || undefined, kondisi: kondisi || undefined, page, limit: 10 })
      .then(setData)
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false))
  }, [search, kategori, kondisi, page])

  useEffect(() => { load() }, [load])

  const remove = async () => {
    setDeleting(true)
    try {
      await inventarisApi.remove(toDelete.id)
      toast.success('Barang berhasil dihapus')
      setToDelete(null)
      load()
    } catch (err) {
      toast.error(errorMessage(err))
    } finally { setDeleting(false) }
  }

  return (
    <div>
      <PageHeader title="Inventaris" description="Kelola daftar barang milik bersama RT.">
        <PermissionGate permission="inventaris:create"><Link to="/kelola-inventaris/baru"><Button>Tambah</Button></Link></PermissionGate>
      </PageHeader>
      <Card>
        <form onSubmit={(e) => { e.preventDefault(); setPage(1) }} className={`${toolbarClass} border-b border-slate-100 p-4`}>
          <input className={toolbarSearchClass} value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari nama barang, lokasi..." />
          <input className={toolbarFieldClass} value={kategori} onChange={(e) => { setKategori(e.target.value); setPage(1) }} placeholder="Filter kategori" />
          <select className={toolbarFieldClass} value={kondisi} onChange={(e) => { setKondisi(e.target.value); setPage(1) }}>
            <option value="">Semua kondisi</option>
            {KONDISI_OPTIONS.map((k) => (
              <option key={k.value} value={k.value}>{k.label}</option>
            ))}
          </select>
          <Button type="submit" variant="secondary">Cari</Button>
        </form>
        {error && <p className="p-4 text-sm text-red-600">{error}</p>}
        {loading ? <TableSkeleton cols={6} /> : data.data.length === 0 ? <EmptyState message="Belum ada data inventaris." /> : (
          <>
            <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b border-slate-200 text-xs uppercase text-slate-500"><th className="px-4 py-3">Kategori / Nama Barang</th><th className="px-4 py-3">Jumlah</th><th className="px-4 py-3">Kondisi</th><th className="px-4 py-3">Lokasi</th><th className="px-4 py-3">Penanggung Jawab</th><th className="px-4 py-3 text-right">Aksi</th></tr></thead><tbody>
              {data.data.map((item) => {
                const labelColor = item.warna_label || '#047857'
                const kondisiMeta = KONDISI_META[item.kondisi_barang] || KONDISI_META.baik
                return (
                  <tr key={item.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className="inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold shadow-xs"
                          style={{ backgroundColor: labelColor, color: getContrastTextColor(labelColor) }}
                        >
                          {item.kategori}
                        </span>
                        <p className="font-medium">
                          <Link to={`/kelola-inventaris/${item.id}`} className="text-slate-900 hover:text-emerald-700">
                            {item.nama_barang}
                          </Link>
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{item.jumlah_barang} unit</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${kondisiMeta.badge}`}>
                        {kondisiMeta.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{item.lokasi_penyimpanan || '-'}</td>
                    <td className="px-4 py-3 text-slate-600">{item.penanggung_jawab || '-'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/kelola-inventaris/${item.id}`} className={rowLinkClass}>Lihat</Link>
                        <ActionMenu
                          items={[
                            can('inventaris:update') && { label: 'Ubah', to: `/kelola-inventaris/${item.id}/edit` },
                            can('inventaris:delete') && { label: 'Hapus', onClick: () => setToDelete(item), danger: true },
                          ]}
                        />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody></table></div>
            <Pagination page={data.pagination.page} totalPage={data.pagination.total_page} onChange={setPage} />
          </>
        )}
      </Card>
      <ConfirmModal open={Boolean(toDelete)} title="Hapus barang?" message={`“${toDelete?.nama_barang || ''}” akan dihapus.`} onConfirm={remove} onCancel={() => setToDelete(null)} loading={deleting} />
    </div>
  )
}