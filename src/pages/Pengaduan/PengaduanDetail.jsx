import { useCallback, useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { toast } from 'sonner'
import { pengaduanApi } from '../../api/index.js'
import { Alert, Badge, Button, Card, ConfirmModal, Field, PageHeader, Spinner, inputClass } from '../../components/ui.jsx'
import { PermissionGate } from '../../components/ProtectedRoute.jsx'
import { errorMessage } from '../../api/client.js'

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

const nextStatus = {
  menunggu: 'diproses',
  diproses: 'selesai',
}

const nextStatusLabel = {
  menunggu: 'Diproses',
  diproses: 'Selesai',
}

export default function PengaduanDetail() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [updating, setUpdating] = useState(false)
  const [catatan, setCatatan] = useState('')
  const [addingCatatan, setAddingCatatan] = useState(false)
  const [statusCatatan, setStatusCatatan] = useState('')
  const [pendingStatus, setPendingStatus] = useState(null)

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    pengaduanApi
      .get(id)
      .then((res) => setData(res))
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  const handleUpdateStatus = async () => {
    if (!pendingStatus) return
    setUpdating(true)
    setSuccess('')
    setError('')
    try {
      await pengaduanApi.updateStatus(id, {
        status: pendingStatus,
        catatan: statusCatatan || `Status diubah ke ${statusLabels[pendingStatus]}`,
      })
      toast.success('Status pengaduan diperbarui')
      setStatusCatatan('')
      setPendingStatus(null)
      setSuccess('Status berhasil diperbarui')
      load()
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setUpdating(false)
    }
  }

  const handleAddCatatan = async (e) => {
    e.preventDefault()
    if (!catatan.trim()) return
    setAddingCatatan(true)
    setSuccess('')
    setError('')
    try {
      await pengaduanApi.addCatatan(id, { catatan: catatan.trim() })
      toast.success('Catatan berhasil ditambahkan')
      setCatatan('')
      setSuccess('Catatan berhasil ditambahkan')
      load()
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setAddingCatatan(false)
    }
  }

  const handleDownloadBukti = async () => {
    try {
      const res = await pengaduanApi.downloadBukti(id)
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      const ext = data?.bukti_file?.split('.').pop() || 'bin'
      link.href = url
      link.setAttribute('download', `bukti-${data?.nama_pelapor || 'pengaduan'}.${ext}`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setError('Gagal mengunduh bukti')
    }
  }

  if (loading) return <Spinner />
  if (error && !data) {
    return (
      <div>
        <PageHeader title="Detail Pengaduan" />
        <Alert type="error">{error}</Alert>
        <div className="mt-4">
          <Link to="/kelola-pengaduan" className="text-sm text-emerald-600 hover:underline">
            Kembali ke daftar pengaduan
          </Link>
        </div>
      </div>
    )
  }

  const canAdvance = data?.status && nextStatus[data.status]

  return (
    <div>
      <PageHeader title="Detail Pengaduan" description={`Pengaduan dari ${data?.nama_pelapor || ''}`} back="/kelola-pengaduan" />

      {success && (
        <div className="mb-4">
          <Alert type="success">{success}</Alert>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h3 className="mb-4 text-sm font-semibold text-slate-700">Informasi Pengaduan</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <div className="text-xs text-slate-500">Nama Pelapor</div>
                <div className="mt-1 text-sm font-medium text-slate-900">{data?.nama_pelapor}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Status</div>
                <div className="mt-1">
                  <Badge color={statusColors[data?.status] || 'slate'}>
                    {statusLabels[data?.status] || data?.status}
                  </Badge>
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Lokasi</div>
                <div className="mt-1 text-sm text-slate-900">{data?.lokasi}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Tanggal</div>
                <div className="mt-1 text-sm text-slate-900">
                  {data?.created_at ? new Date(data.created_at).toLocaleDateString('id-ID', {
                    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                  }) : '-'}
                </div>
              </div>
            </div>
            <div className="mt-4">
              <div className="text-xs text-slate-500">Keterangan</div>
              <div className="mt-1 whitespace-pre-wrap text-sm text-slate-900">{data?.keterangan}</div>
            </div>
            {data?.bukti_file && (
              <div className="mt-4">
                <div className="text-xs text-slate-500 mb-1">Bukti</div>
                <Button variant="secondary" size="sm" onClick={handleDownloadBukti}>
                  Unduh Bukti
                </Button>
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h3 className="mb-4 text-sm font-semibold text-slate-700">Riwayat Penanganan</h3>
            {!data?.riwayat || data.riwayat.length === 0 ? (
              <p className="text-sm text-slate-400">Belum ada riwayat penanganan.</p>
            ) : (
              <div className="space-y-3">
                {data.riwayat.map((r) => (
                  <div key={r.id} className="rounded-lg border border-slate-200 p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge color={statusColors[r.status] || 'slate'}>
                          {statusLabels[r.status] || r.status}
                        </Badge>
                        <span className="text-xs text-slate-500">
                          {new Date(r.created_at).toLocaleString('id-ID')}
                        </span>
                      </div>
                      <span className="text-xs text-slate-600">{r.ditangani_oleh}</span>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{r.catatan}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          {canAdvance && (
            <PermissionGate permission="pengaduan:update">
              <Card className="p-6">
                <h3 className="mb-4 text-sm font-semibold text-slate-700">Ubah Status</h3>
                <p className="text-sm text-slate-500">
                  Ubah status pengaduan ini menjadi{' '}
                  <span className="font-medium text-slate-800">{nextStatusLabel[data.status]}</span>.
                </p>
                <Button
                  className="mt-3 w-full"
                  onClick={() => setPendingStatus(nextStatus[data.status])}
                  disabled={updating}
                >
                  Ubah ke {nextStatusLabel[data.status]}
                </Button>
              </Card>
            </PermissionGate>
          )}

          <PermissionGate permission="pengaduan:update">
            <Card className="p-6">
              <h3 className="mb-4 text-sm font-semibold text-slate-700">Tambah Catatan</h3>
              <form onSubmit={handleAddCatatan}>
                <Field label="Catatan" required>
                  <textarea
                    className={inputClass + ' resize-none'}
                    rows={3}
                    placeholder="Tulis catatan penanganan..."
                    value={catatan}
                    onChange={(e) => setCatatan(e.target.value)}
                    required
                  />
                </Field>
                <Button type="submit" variant="secondary" className="mt-3 w-full" disabled={addingCatatan || !catatan.trim()}>
                  {addingCatatan ? 'Menyimpan...' : 'Tambah Catatan'}
                </Button>
              </form>
            </Card>
          </PermissionGate>
        </div>
      </div>

      <ConfirmModal
        open={!!pendingStatus}
        title="Ubah Status Pengaduan"
        message={`Status akan diubah dari "${statusLabels[data?.status] || '-'}" menjadi "${
          nextStatusLabel[pendingStatus] || '-'
        }". Lanjutkan?`}
        confirmText="Ubah Status"
        cancelText="Batal"
        danger={false}
        loading={updating}
        onConfirm={handleUpdateStatus}
        onCancel={() => {
          if (!updating) setPendingStatus(null)
        }}
      >
        <div className="mt-4">
          <Field label="Catatan (opsional)">
            <textarea
              className={inputClass + ' resize-none'}
              rows={3}
              placeholder="Catatan perubahan status..."
              value={statusCatatan}
              onChange={(e) => setStatusCatatan(e.target.value)}
            />
          </Field>
        </div>
      </ConfirmModal>
    </div>
  )
}
