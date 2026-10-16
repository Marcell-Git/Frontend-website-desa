import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { inventarisApi } from '../../api/index.js'
import { Alert, Button, Card, ConfirmModal, PageHeader, Spinner } from '../../components/ui.jsx'
import { PermissionGate } from '../../components/ProtectedRoute.jsx'
import { useAuth } from '../../auth/AuthContext.jsx'
import { errorMessage } from '../../api/client.js'
import { assetUrl } from '../../api/config.js'
import { getContrastTextColor, NAMA_BULAN } from '../LandingPage/format.js'
import { KONDISI_META } from './constants.js'
import { formatTanggal } from '../../lib/tanggal.js'

function periodeIndo(value) {
  if (!value || !/^\d{4}-\d{2}$/.test(value)) return value || null
  const [tahun, bulan] = value.split('-')
  const nama = NAMA_BULAN[parseInt(bulan, 10) - 1]
  return nama && tahun ? `${nama} ${tahun}` : value
}

function Field({ label, children }) {
  return (
    <div>
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 text-sm font-medium text-slate-900">{children}</div>
    </div>
  )
}

export default function InventarisDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { can } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [toDelete, setToDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    inventarisApi
      .get(id)
      .then(setData)
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  const remove = async () => {
    setDeleting(true)
    try {
      await inventarisApi.remove(id)
      toast.success('Barang berhasil dihapus')
      navigate('/kelola-inventaris')
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setDeleting(false)
    }
  }

  if (loading) return <Spinner />
  if (error && !data) {
    return (
      <div>
        <PageHeader title="Detail Inventaris" />
        <Alert type="error">{error}</Alert>
        <div className="mt-4">
          <Link to="/kelola-inventaris" className="text-sm text-emerald-600 hover:underline">
            Kembali ke daftar inventaris
          </Link>
        </div>
      </div>
    )
  }

  const labelColor = data?.warna_label || '#047857'
  const kondisi = KONDISI_META[data?.kondisi_barang] || KONDISI_META.baik
  const foto = data?.foto ? assetUrl(data.foto) : null

  return (
    <div>
      <PageHeader title="Detail Inventaris" description={data?.nama_barang} back="/kelola-inventaris">
        <div className="flex items-center gap-2">
          {can('inventaris:update') && (
            <Link to={`/kelola-inventaris/${data.id}/edit`}>
              <Button variant="secondary">Ubah</Button>
            </Link>
          )}
          {can('inventaris:delete') && (
            <Button variant="danger" onClick={() => setToDelete(true)}>Hapus</Button>
          )}
        </div>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6">
          {foto ? (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <img src={foto} alt={data.nama_barang} className="h-64 w-full object-cover" />
            </div>
          ) : (
            <div className="flex items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-12">
              <span className="text-sm text-slate-400">Belum ada foto</span>
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold shadow-xs"
                style={{ backgroundColor: labelColor, color: getContrastTextColor(labelColor) }}
              >
                {data.kategori}
              </span>
              <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${kondisi.badge}`}>
                {kondisi.label}
              </span>
            </div>
            <h2 className="mt-3 font-display text-xl font-bold text-slate-900">{data.nama_barang}</h2>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="Jumlah Barang">{data.jumlah_barang} unit</Field>
              <Field label="Lokasi Penyimpanan">{data.lokasi_penyimpanan || '-'}</Field>
              <Field label="Penanggung Jawab">{data.penanggung_jawab || '-'}</Field>
              <Field label="Periode Perolehan">{periodeIndo(data.periode_perolehan) || '-'}</Field>
              <Field label="Dibuat Oleh">{data.nama_user || '-'}</Field>
              <Field label="Terakhir Diperbarui">
                {formatTanggal(data.updated_at)}
              </Field>
            </div>

            <div className="mt-5">
              <div className="text-xs text-slate-500">Keterangan</div>
              {data.keterangan ? (
                <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-slate-900">{data.keterangan}</p>
              ) : (
                <p className="mt-1 text-sm text-slate-400">Tidak ada keterangan.</p>
              )}
            </div>
          </Card>
        </div>
      </div>

      <ConfirmModal
        open={toDelete}
        title="Hapus barang?"
        message={`“${data?.nama_barang || ''}” akan dihapus permanen.`}
        onConfirm={remove}
        onCancel={() => setToDelete(false)}
        loading={deleting}
      />
    </div>
  )
}