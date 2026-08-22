import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { anggotaApi, kkApi } from '../../api/index.js'
import {
  Badge,
  Button,
  Card,
  ConfirmModal,
  EmptyState,
  PageHeader,
  Spinner,
} from '../../components/ui.jsx'
import { PermissionGate } from '../../components/ProtectedRoute.jsx'
import { errorMessage } from '../../api/client.js'
import { useAuth } from '../../auth/AuthContext.jsx'

function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between gap-4 py-1.5">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right font-medium text-slate-900">{value || '-'}</dd>
    </div>
  )
}

export default function KKDetail() {
  const { id } = useParams()
  const { can } = useAuth()
  const navigate = useNavigate()

  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [toDelete, setToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [toSetKepala, setToSetKepala] = useState(null)
  const [settingKepala, setSettingKepala] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    kkApi
      .get(id)
      .then(setDetail)
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  const handleDeleteAnggota = async () => {
    setDeleting(true)
    try {
      await anggotaApi.remove(toDelete.id)
      toast.success('Anggota berhasil dihapus dari KK')
      setToDelete(null)
      load()
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setDeleting(false)
    }
  }

  const handleSetKepala = async () => {
    setSettingKepala(true)
    try {
      await anggotaApi.setKepala(toSetKepala.id)
      toast.success('Kepala keluarga berhasil ditetapkan')
      setToSetKepala(null)
      load()
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setSettingKepala(false)
    }
  }

  if (loading) return <Spinner />
  if (error) return <div className="text-sm text-red-600">{error}</div>
  if (!detail) return null

  const kk = detail.kartu_keluarga
  const anggota = detail.anggota || []

  return (
    <div>
      <PageHeader title={`Detail KK ${kk.nomor_kk}`} description={kk.alamat}>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => navigate(-1)}>
            Kembali
          </Button>
          <PermissionGate permission="kartu-keluarga:update">
            <Link to={`/kartu-keluarga/${kk.id}/edit`}>
              <Button variant="secondary">Ubah Data KK</Button>
            </Link>
          </PermissionGate>
          <PermissionGate permission="anggota:create">
            <Link to={`/anggota/baru?kk=${kk.id}`}>
              <Button>Tambah Anggota</Button>
            </Link>
          </PermissionGate>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="p-6">
          <h3 className="mb-3 text-sm font-semibold text-slate-700">Data Kartu Keluarga</h3>
          <dl className="text-sm">
            <DetailRow label="Nomor KK" value={kk.nomor_kk} />
            <DetailRow label="Kepala Keluarga" value={kk.nama_kepala_keluarga} />
            <DetailRow label="NIK Kepala" value={kk.nik_kepala_keluarga} />
            <DetailRow label="No. HP" value={kk.nomor_hp} />
            <DetailRow label="Alamat" value={kk.alamat} />
            <DetailRow label="RT / RW" value={`${kk.rt} / ${kk.rw}`} />
            <DetailRow label="Desa / Kelurahan" value={kk.desa} />
            <DetailRow label="Kecamatan" value={kk.kecamatan} />
            <DetailRow label="Kabupaten / Kota" value={kk.kabupaten} />
            <DetailRow label="Provinsi" value={kk.provinsi} />
            <DetailRow label="Jumlah Anggota" value={`${kk.jumlah_anggota} orang`} />
          </dl>
        </Card>

        <Card className="p-6 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700">
              Anggota Keluarga ({anggota.length})
            </h3>
          </div>
          {anggota.length === 0 ? (
            <EmptyState message="Belum ada anggota keluarga pada KK ini." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                    <th className="px-3 py-2">Nama</th>
                    <th className="px-3 py-2">Jenis Kelamin</th>
                    <th className="px-3 py-2">Hubungan</th>
                    <th className="px-3 py-2 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {anggota.map((a) => (
                    <tr key={a.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                      <td className="px-3 py-2.5">
                        <div className="font-medium text-slate-900">{a.nama_lengkap}</div>
                        <div className="text-xs text-slate-400">{a.nik}</div>
                      </td>
                      <td className="px-3 py-2.5 text-slate-600">{a.jenis_kelamin}</td>
                      <td className="px-3 py-2.5">
                        {a.hubungan_keluarga === 'Kepala Keluarga' ? (
                          <Badge color="green">Kepala Keluarga</Badge>
                        ) : (
                          <span className="text-slate-600">{a.hubungan_keluarga}</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex justify-end gap-2">
                          {a.hubungan_keluarga === 'Kepala Keluarga' ? (
                            <span
                              className="cursor-not-allowed rounded-lg px-2 py-1 text-xs font-medium text-slate-300"
                              title="Anggota ini sudah merupakan kepala keluarga"
                            >
                              Jadikan Kepala
                            </span>
                          ) : can('anggota:update') ? (
                            <button
                              onClick={() => setToSetKepala(a)}
                              className="rounded-lg px-2 py-1 text-xs font-medium text-amber-700 hover:bg-amber-50"
                            >
                              Jadikan Kepala
                            </button>
                          ) : null}
                          {a.hubungan_keluarga === 'Kepala Keluarga' ? (
                            <span
                              className="cursor-not-allowed rounded-lg px-2 py-1 text-xs font-medium text-slate-300"
                              title="Kepala keluarga tidak dapat dipindahkan. Tentukan pengganti kepala keluarga terlebih dahulu."
                            >
                              Pindah
                            </span>
                          ) : can('anggota:update') ? (
                            <Link
                              to={`/anggota/${a.id}/pindah`}
                              className="rounded-lg px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
                            >
                              Pindah
                            </Link>
                          ) : null}
                          {can('anggota:update') && (
                            <Link
                              to={`/anggota/${a.id}/edit`}
                              className="rounded-lg px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
                            >
                              Ubah
                            </Link>
                          )}
                          {a.hubungan_keluarga === 'Kepala Keluarga' && anggota.length > 1 ? (
                            <span
                              className="cursor-not-allowed rounded-lg px-2 py-1 text-xs font-medium text-slate-300"
                              title="Kepala keluarga tidak dapat dihapus. Tentukan pengganti kepala keluarga terlebih dahulu."
                            >
                              Hapus
                            </span>
                          ) : can('anggota:delete') ? (
                            <button
                              onClick={() => setToDelete(a)}
                              className="rounded-lg px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                            >
                              Hapus
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      <ConfirmModal
        open={!!toDelete}
        title="Hapus Anggota"
        message={
          toDelete?.hubungan_keluarga === 'Kepala Keluarga'
            ? `${toDelete?.nama_lengkap} adalah satu-satunya anggota KK ini. Menghapusnya akan mengosongkan KK sehingga KK ini juga dapat dihapus. Lanjutkan?`
            : `Yakin ingin menghapus ${toDelete ? toDelete.nama_lengkap : ''}?`
        }
        onConfirm={handleDeleteAnggota}
        onCancel={() => setToDelete(null)}
        loading={deleting}
      />
      <ConfirmModal
        open={!!toSetKepala}
        title="Jadikan Kepala Keluarga"
        message={`Jadikan ${toSetKepala ? toSetKepala.nama_lengkap : ''} sebagai kepala keluarga?`}
        onConfirm={handleSetKepala}
        onCancel={() => setToSetKepala(null)}
        loading={settingKepala}
        confirmText="Ya, Jadikan Kepala"
      />
    </div>
  )
}
