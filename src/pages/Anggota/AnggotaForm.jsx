import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { anggotaApi, kkApi } from '../../api/index.js'
import { Alert, Button, Card, Field, PageHeader, Spinner, inputClass } from '../../components/ui.jsx'
import { errorMessage, fieldErrors } from '../../api/client.js'

const emptyForm = {
  kartu_keluarga_id: '',
  nik: '',
  nama_lengkap: '',
  tempat_lahir: '',
  tanggal_lahir: '',
  jenis_kelamin: 'L',
  agama: '',
  pekerjaan: '',
  nomor_hp: '',
  hubungan_keluarga: '',
  status: true,
}

export default function AnggotaForm() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const isEdit = !!id
  const navigate = useNavigate()

  const [form, setForm] = useState(emptyForm)
  const [kkOptions, setKkOptions] = useState([])
  const [loading, setLoading] = useState(isEdit)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [errors, setErrors] = useState({})

  useEffect(() => {
    kkApi
      .list({ limit: 100 })
      .then((res) => setKkOptions(res.data))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!isEdit) {
      const kk = searchParams.get('kk')
      if (kk) setForm((f) => ({ ...f, kartu_keluarga_id: kk }))
      return
    }
    anggotaApi
      .get(id)
      .then((a) =>
        setForm({
          kartu_keluarga_id: a.kartu_keluarga_id,
          nik: a.nik,
          nama_lengkap: a.nama_lengkap,
          tempat_lahir: a.tempat_lahir,
          tanggal_lahir: a.tanggal_lahir,
          jenis_kelamin: a.jenis_kelamin,
          agama: a.agama,
          pekerjaan: a.pekerjaan || '',
          nomor_hp: a.nomor_hp || '',
          hubungan_keluarga: a.hubungan_keluarga,
          status: a.status,
        }),
      )
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false))
  }, [id, isEdit, searchParams])

  const set = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: key === 'status' ? e.target.checked : e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setErrors({})
    setSubmitting(true)
    try {
      if (isEdit) {
        await anggotaApi.update(id, {
          nama_lengkap: form.nama_lengkap,
          nomor_hp: form.nomor_hp || null,
          agama: form.agama,
          pekerjaan: form.pekerjaan || null,
          hubungan_keluarga: form.hubungan_keluarga,
          status: form.status,
        })
        navigate(`/kartu-keluarga/${form.kartu_keluarga_id}`)
      } else {
        const body = {
          kartu_keluarga_id: form.kartu_keluarga_id,
          nik: form.nik,
          nama_lengkap: form.nama_lengkap,
          tempat_lahir: form.tempat_lahir,
          tanggal_lahir: form.tanggal_lahir,
          jenis_kelamin: form.jenis_kelamin,
          agama: form.agama,
          pekerjaan: form.pekerjaan || null,
          nomor_hp: form.nomor_hp || null,
          hubungan_keluarga: form.hubungan_keluarga,
          status: form.status,
        }
        await anggotaApi.create(body)
        navigate(`/kartu-keluarga/${form.kartu_keluarga_id}`)
      }
    } catch (err) {
      const fe = fieldErrors(err)
      setErrors(fe)
      setError(Object.keys(fe).length > 0 ? '' : errorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <Spinner />

  const hubunganOptions = [
    'Suami',
    'Istri',
    'Anak',
    'Menantu',
    'Cucu',
    'Orang Tua',
    'Mertua',
    'Famili Lain',
    'Pembantu',
    'Lainnya',
  ]

  return (
    <div className="max-w-3xl">
      <PageHeader
        title={isEdit ? 'Ubah Anggota Keluarga' : 'Tambah Anggota Keluarga'}
        description={isEdit ? 'Perbarui data anggota' : 'Isi data anggota keluarga baru'}
      >
        <Button variant="secondary" onClick={() => navigate(-1)}>
          Kembali
        </Button>
      </PageHeader>

      {error && (
        <div className="mb-4">
          <Alert>{error}</Alert>
        </div>
      )}

      {!isEdit && !form.kartu_keluarga_id && kkOptions.length === 0 && (
        <div className="mb-4">
          <Alert type="warning">
            Belum ada Kartu Keluarga. Tambahkan terlebih dahulu di{' '}
            <Link to="/kartu-keluarga/baru" className="font-medium underline">
              halaman KK
            </Link>
            .
          </Alert>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Card className="p-6">
          <h3 className="mb-4 text-sm font-semibold text-slate-700">Data Anggota</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {!isEdit && (
              <div className="sm:col-span-2">
                <Field label="Kartu Keluarga" required error={errors.kartu_keluarga_id}>
                  <select
                    className={inputClass}
                    value={form.kartu_keluarga_id}
                    onChange={set('kartu_keluarga_id')}
                  >
                    <option value="">Pilih KK</option>
                    {kkOptions.map((kk) => (
                      <option key={kk.id} value={kk.id}>
                        {kk.nomor_kk} - {kk.nama_kepala_keluarga || ''} ({kk.alamat})
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
            )}
            {!isEdit && (
              <Field label="NIK" required error={errors.nik}>
                <input
                  className={inputClass}
                  value={form.nik}
                  onChange={set('nik')}
                  maxLength={16}
                  inputMode="numeric"
                />
              </Field>
            )}
            <Field label="Nama Lengkap" required error={errors.nama_lengkap}>
              <input className={inputClass} value={form.nama_lengkap} onChange={set('nama_lengkap')} />
            </Field>
            <Field label="Tempat Lahir" required error={errors.tempat_lahir}>
              <input className={inputClass} value={form.tempat_lahir} onChange={set('tempat_lahir')} />
            </Field>
            <Field label="Tanggal Lahir" required error={errors.tanggal_lahir}>
              <input
                type="date"
                className={inputClass}
                value={form.tanggal_lahir}
                onChange={set('tanggal_lahir')}
              />
            </Field>
            <Field label="Jenis Kelamin" required error={errors.jenis_kelamin}>
              <select className={inputClass} value={form.jenis_kelamin} onChange={set('jenis_kelamin')}>
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
            </Field>
            <Field label="Agama" required error={errors.agama}>
              <select className={inputClass} value={form.agama} onChange={set('agama')}>
                <option value="">Pilih</option>
                <option>Islam</option>
                <option>Kristen</option>
                <option>Katolik</option>
                <option>Hindu</option>
                <option>Buddha</option>
                <option>Konghucu</option>
              </select>
            </Field>
            <Field label="Pekerjaan">
              <input className={inputClass} value={form.pekerjaan} onChange={set('pekerjaan')} />
            </Field>
            <Field label="No. HP">
              <input className={inputClass} value={form.nomor_hp} onChange={set('nomor_hp')} />
            </Field>
            <Field
              label="Hubungan Keluarga"
              required={!isEdit || form.hubungan_keluarga === 'Kepala Keluarga' ? false : true}
              error={errors.hubungan_keluarga}
            >
              <select
                className={inputClass}
                value={form.hubungan_keluarga}
                onChange={set('hubungan_keluarga')}
                disabled={isEdit && form.hubungan_keluarga === 'Kepala Keluarga'}
              >
                <option value="">Pilih</option>
                <option value="Kepala Keluarga">Kepala Keluarga</option>
                {hubunganOptions.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </Field>
            {!isEdit && (
              <Field label="Status">
                <label className="flex items-center gap-2 pt-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={form.status}
                    onChange={set('status')}
                    className="h-4 w-4 accent-emerald-600"
                  />
                  Aktif sebagai warga
                </label>
              </Field>
            )}
          </div>
        </Card>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" type="button" onClick={() => navigate(-1)}>
            Batal
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Simpan Anggota'}
          </Button>
        </div>
      </form>
    </div>
  )
}
