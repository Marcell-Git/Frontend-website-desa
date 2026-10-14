import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { anggotaApi, kkApi } from '../../api/index.js'
import { FaPhone, FaLocationDot, FaUsers, FaVenusMars } from 'react-icons/fa6'
import {
  ActionMenu,
  BackLink,
  Badge,
  Button,
  Card,
  ConfirmModal,
  EmptyState,
  Spinner,
} from '../../components/ui.jsx'
import { PermissionGate } from '../../components/ProtectedRoute.jsx'
import { errorMessage } from '../../api/client.js'
import { useAuth } from '../../auth/AuthContext.jsx'

const KEPALA = 'Kepala Keluarga'

// 1521122001000101 -> 1521 1220 0100 0101 agar mudah dibaca dan dicocokkan.
const formatNomor = (n) => (n || '').replace(/(\d{4})(?=\d)/g, '$1 ')

function hitungUmur(tanggal) {
  if (!tanggal) return null
  const lahir = new Date(String(tanggal).slice(0, 10))
  if (Number.isNaN(lahir.getTime())) return null
  const now = new Date()
  let umur = now.getFullYear() - lahir.getFullYear()
  const belum =
    now.getMonth() < lahir.getMonth() ||
    (now.getMonth() === lahir.getMonth() && now.getDate() < lahir.getDate())
  if (belum) umur -= 1
  return umur
}

function initials(nama) {
  return (nama || '?')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

function InfoChip({ icon, label, value }) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-emerald-700 shadow-sm">
        {icon}
      </span>
      <div className="min-w-0">
        <div className="text-xs text-slate-400">{label}</div>
        <div className="truncate text-sm font-semibold text-slate-800">{value || '-'}</div>
      </div>
    </div>
  )
}

function Field({ label, value }) {
  return (
    <div>
      <dt className="text-xs text-slate-400">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-slate-800">{value || '-'}</dd>
    </div>
  )
}

export default function KKDetail() {
  const { id } = useParams()
  const { can } = useAuth()

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
  // Kepala keluarga selalu di urutan teratas.
  const anggota = [...(detail.anggota || [])].sort(
    (a, b) => (b.hubungan_keluarga === KEPALA) - (a.hubungan_keluarga === KEPALA),
  )
  const jumlahL = anggota.filter((a) => a.jenis_kelamin === 'L').length
  const jumlahP = anggota.filter((a) => a.jenis_kelamin === 'P').length

  const menuAnggota = (a) => {
    const kepala = a.hubungan_keluarga === KEPALA
    return [
      can('anggota:update') && {
        label: 'Ubah data',
        to: `/anggota/${a.id}/edit`,
      },
      can('anggota:update') &&
        !kepala && {
          label: 'Jadikan kepala keluarga',
          onClick: () => setToSetKepala(a),
        },
      can('anggota:update') && {
        label: 'Pindah ke KK lain',
        to: `/anggota/${a.id}/pindah`,
        disabled: kepala,
        hint: 'Tentukan kepala keluarga pengganti dulu.',
      },
      can('anggota:delete') && {
        label: 'Hapus dari KK',
        danger: true,
        onClick: () => setToDelete(a),
        disabled: kepala && anggota.length > 1,
        hint: 'Tentukan kepala keluarga pengganti dulu.',
      },
    ]
  }

  return (
    <div>
      <BackLink />

      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <div className="text-xs font-medium uppercase tracking-wider text-slate-400">Kartu Keluarga</div>
          <h1 className="mt-1 text-2xl font-medium tracking-tight text-slate-900 sm:text-3xl">
            Keluarga {kk.nama_kepala_keluarga || <span className="text-slate-400">tanpa kepala</span>}
          </h1>
          <p className="mt-1.5 text-sm tabular-nums tracking-wide text-slate-500">
            No. KK {formatNomor(kk.nomor_kk)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
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
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <InfoChip icon={<FaUsers className="h-4 w-4" />} label="Jumlah anggota" value={`${anggota.length} orang`} />
        <InfoChip
          icon={<FaVenusMars className="h-4 w-4" />}
          label="Laki-laki / Perempuan"
          value={`${jumlahL} L · ${jumlahP} P`}
        />
        <InfoChip icon={<FaLocationDot className="h-4 w-4" />} label="RT / RW" value={`${kk.rt} / ${kk.rw}`} />
        <InfoChip icon={<FaPhone className="h-4 w-4" />} label="No. HP" value={kk.nomor_hp} />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="p-5 xl:col-span-2">
          <h3 className="text-base font-semibold text-slate-800">Anggota Keluarga</h3>
          <p className="mt-0.5 text-xs text-slate-400">{anggota.length} orang terdaftar di KK ini</p>

          {anggota.length === 0 ? (
            <EmptyState message="Belum ada anggota keluarga pada KK ini." />
          ) : (
            <ul className="mt-4 space-y-2">
              {anggota.map((a) => {
                const umur = hitungUmur(a.tanggal_lahir)
                const kepala = a.hubungan_keluarga === KEPALA
                return (
                  <li
                    key={a.id}
                    className={`flex items-center gap-3 rounded-2xl p-3 sm:gap-4 ${
                      kepala ? 'bg-emerald-50/70 ring-1 ring-emerald-100' : 'hover:bg-slate-50'
                    }`}
                  >
                    <span
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                        a.jenis_kelamin === 'P' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'
                      }`}
                      title={a.jenis_kelamin === 'P' ? 'Perempuan' : 'Laki-laki'}
                    >
                      {initials(a.nama_lengkap)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="truncate font-medium text-slate-900">{a.nama_lengkap}</span>
                        {kepala ? (
                          <Badge color="green">Kepala Keluarga</Badge>
                        ) : (
                          <Badge color="slate">{a.hubungan_keluarga}</Badge>
                        )}
                      </div>
                      <div className="mt-0.5 truncate text-xs text-slate-400">
                        NIK {a.nik}
                        {umur !== null && ` · ${umur} tahun`}
                        {a.pekerjaan && ` · ${a.pekerjaan}`}
                      </div>
                    </div>
                    <ActionMenu label={`Aksi untuk ${a.nama_lengkap}`} items={menuAnggota(a)} />
                  </li>
                )
              })}
            </ul>
          )}
        </Card>

        <Card className="self-start p-5">
          <h3 className="text-base font-semibold text-slate-800">Alamat</h3>
          <p className="mt-3 text-sm leading-relaxed text-slate-700">{kk.alamat || '-'}</p>
          <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-slate-100 pt-4">
            <Field label="Desa / Kelurahan" value={kk.desa} />
            <Field label="Kecamatan" value={kk.kecamatan} />
            <Field label="Kabupaten / Kota" value={kk.kabupaten} />
            <Field label="Provinsi" value={kk.provinsi} />
          </dl>
        </Card>
      </div>

      <ConfirmModal
        open={!!toDelete}
        title="Hapus Anggota"
        message={
          toDelete?.hubungan_keluarga === KEPALA
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
