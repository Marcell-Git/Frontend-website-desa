import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { backupApi } from '../../api/index.js'
import { errorMessage } from '../../api/client.js'
import { PermissionGate } from '../../components/ProtectedRoute.jsx'
import {
  Alert,
  Button,
  Card,
  ConfirmModal,
  EmptyState,
  PageHeader,
  Pagination,
  TableSkeleton,
  inputClass,
} from '../../components/ui.jsx'

function formatSize(bytes) {
  if (bytes == null) return '-'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export default function BackupList() {
  const [data, setData] = useState({ data: [], pagination: {} })
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const [restoreTarget, setRestoreTarget] = useState(null)
  const [restoring, setRestoring] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    backupApi
      .list({ search: search || undefined, page, limit: 15 })
      .then((res) => setData(res))
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false))
  }, [search, page])

  useEffect(() => {
    load()
  }, [load])

  const submitSearch = (e) => {
    e.preventDefault()
    setPage(1)
  }

  const handleCreate = () => {
    setCreating(true)
    setError('')
    setMessage('')
    backupApi
      .create()
      .then((res) => {
        toast.success('Backup berhasil dibuat')
        setMessage(`Backup "${res.nama_file}" berhasil dibuat.`)
        load()
      })
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setCreating(false))
  }

  const handleRestore = () => {
    if (!restoreTarget) return
    setRestoring(true)
    setError('')
    setMessage('')
    backupApi
      .restore(restoreTarget.id)
      .then((res) => {
        toast.success('Database berhasil dipulihkan')
        setMessage(res.message || 'Database berhasil dipulihkan.')
        setRestoreTarget(null)
        load()
      })
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setRestoring(false))
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    setDeleting(true)
    setError('')
    setMessage('')
    backupApi
      .remove(deleteTarget.id)
      .then(() => {
        toast.success('Backup berhasil dihapus')
        setMessage(`Backup "${deleteTarget.nama_file}" berhasil dihapus.`)
        setDeleteTarget(null)
        load()
      })
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setDeleting(false))
  }

  const handleDownload = (item) => {
    setMessage('')
    backupApi.download(item.id, item.nama_file).catch((err) => setError(errorMessage(err)))
  }

  return (
    <div>
      <PageHeader
        title="Backup Database"
        description="Kelola pencadangan dan pemulihan database sistem"
      >
        <PermissionGate permission="backup:create">
          <Button onClick={handleCreate} disabled={creating}>
            {creating ? 'Membuat backup...' : 'Buat Backup'}
          </Button>
        </PermissionGate>
      </PageHeader>

      {error && (
        <div className="mb-4">
          <Alert type="error">{error}</Alert>
        </div>
      )}
      {message && (
        <div className="mb-4">
          <Alert type="success">{message}</Alert>
        </div>
      )}

      <Card>
        <div className="border-b border-slate-200 p-4">
          <form onSubmit={submitSearch} className="flex flex-wrap gap-2">
            <input
              className={`${inputClass} max-w-xs`}
              placeholder="Cari nama file backup..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button variant="secondary" type="submit">Cari</Button>
          </form>
        </div>

        {loading ? (
          <TableSkeleton rows={15} cols={5} />
        ) : data.data.length === 0 ? (
          <EmptyState message="Belum ada file backup. Klik tombol Buat Backup untuk membuat cadangan database." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                    <th className="px-4 py-3">Nama File</th>
                    <th className="px-4 py-3">Tanggal Backup</th>
                    <th className="px-4 py-3">Ukuran File</th>
                    <th className="px-4 py-3">Dibuat Oleh</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((item) => (
                    <tr key={item.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">{item.nama_file}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                        {new Date(item.tanggal_backup).toLocaleString('id-ID', {
                          day: '2-digit', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-600">{formatSize(item.ukuran_file)}</td>
                      <td className="px-4 py-3 text-slate-600">{item.dibuat_oleh || '-'}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <button
                            className="rounded-lg px-2.5 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-50"
                            onClick={() => handleDownload(item)}
                          >
                            Unduh
                          </button>
                          <PermissionGate permission="backup:restore">
                            <button
                              className="rounded-lg px-2.5 py-1 text-xs font-medium text-blue-700 hover:bg-blue-50"
                              onClick={() => setRestoreTarget(item)}
                            >
                              Restore
                            </button>
                          </PermissionGate>
                          <PermissionGate permission="backup:delete">
                            <button
                              className="rounded-lg px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                              onClick={() => setDeleteTarget(item)}
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
        open={!!restoreTarget}
        title="Restore Database"
        message={`Seluruh data saat ini akan digantikan oleh data dari file "${restoreTarget?.nama_file}". Proses ini tidak dapat dibatalkan. Lanjutkan restore?`}
        confirmText="Restore"
        loading={restoring}
        onConfirm={handleRestore}
        onCancel={() => setRestoreTarget(null)}
      />

      <ConfirmModal
        open={!!deleteTarget}
        title="Hapus Backup"
        message={`File backup "${deleteTarget?.nama_file}" akan dihapus permanen dari penyimpanan. Lanjutkan?`}
        confirmText="Hapus"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
