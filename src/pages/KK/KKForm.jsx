import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { kkApi } from '../../api/index.js'
import { Alert, Button, Card, Field, PageHeader, Spinner, inputClass } from '../../components/ui.jsx'
import { errorMessage, fieldErrors } from '../../api/client.js'

const emptyForm = {
  nomor_kk: '',
  nomor_hp: '',
  alamat: '',
  rt: '26',
  rw: '',
  desa: 'Tegalyoso',
  kecamatan: 'Klaten Selatan',
  kabupaten: 'Klaten',
  provinsi: 'Jawa Tengah',
}

const emptyKepala = {
  nik: '',
  nama_lengkap: '',
  tempat_lahir: '',
  tanggal_lahir: '',
  jenis_kelamin: 'L',
  agama: '',
  pekerjaan: '',
  nomor_hp: '',
}

export default function KKForm() {
  const { id } = useParams()
  const isEdit = !!id
  const navigate = useNavigate()

  const [form, setForm] = useState(emptyForm)
  const [kepala, setKepala] = useState(emptyKepala)
  const [withKepala, setWithKepala] = useState(true)
  const [loading, setLoading] = useState(isEdit)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (!isEdit) return
    kkApi
      .get(id)
      .then((detail) => {
        const k = detail.kartu_keluarga
        setForm({
          nomor_hp: k.nomor_hp || '',
          alamat: k.alamat,
          rt: k.rt,
          rw: k.rw,
          desa: k.desa,
          kecamatan: k.kecamatan,
          kabupaten: k.kabupaten,
          provinsi: k.provinsi,
        })
      })
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false))
  }, [id, isEdit])

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))
  const setKep = (key) => (e) => setKepala((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setErrors({})
    setSubmitting(true)
    try {
      if (isEdit) {
        const body = {
          nomor_hp: form.nomor_hp || null,
          alamat: form.alamat,
          rt: form.rt,
          rw: form.rw,
          desa: form.desa,
          kecamatan: form.kecamatan,
          kabupaten: form.kabupaten,
          provinsi: form.provinsi,
        }
        await kkApi.update(id, body)
        navigate(`/kartu-keluarga/${id}`)
      } else {
        const body = {
          nomor_kk: form.nomor_kk,
          nomor_hp: form.nomor_hp || null,
          alamat: form.alamat,
          rt: form.rt,
          rw: form.rw,
          desa: form.desa,
          kecamatan: form.kecamatan,
          kabupaten: form.kabupaten,
          provinsi: form.provinsi,
        }
        if (withKepala) {
          body.kepala_keluarga = {
            nik: kepala.nik,
            nama_lengkap: kepala.nama_lengkap,
            tempat_lahir: kepala.tempat_lahir,
            tanggal_lahir: kepala.tanggal_lahir,
            jenis_kelamin: kepala.jenis_kelamin,
            agama: kepala.agama,
            pekerjaan: kepala.pekerjaan || null,
            nomor_hp: kepala.nomor_hp || null,
          }
        }
        const res = await kkApi.create(body)
        navigate(`/kartu-keluarga/${res.id}`)
      }
    } catch (err) {
      setError(errorMessage(err))
      setErrors(fieldErrors(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <Spinner />

  const namaError = errors.kepala_keluarga
    ? Array.isArray(errors.kepala_keluarga) ? errors.kepala_keluarga[0] : null
    : null

  return (
    <div className="max-w-3xl">
      <PageHeader
        title={isEdit ? 'Ubah Kartu Keluarga' : 'Tambah Kartu Keluarga'}
        description={isEdit ? 'Perbarui data KK' : 'Isi data kartu keluarga baru'}
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

      <form onSubmit={handleSubmit}>
        <Card className="p-6">
          <h3 className="mb-4 text-sm font-semibold text-slate-700">Data Kartu Keluarga</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {!isEdit && (
              <div className="sm:col-span-2">
                <Field label="Nomor KK" required error={errors.nomor_kk}>
                  <input
                    className={inputClass}
                    value={form.nomor_kk}
                    onChange={set('nomor_kk')}
                    placeholder="16 digit angka"
                    maxLength={16}
                    inputMode="numeric"
                  />
                </Field>
              </div>
            )}
            <div className="sm:col-span-2">
              <Field label="Alamat" required error={errors.alamat}>
                <input className={inputClass} value={form.alamat} onChange={set('alamat')} />
              </Field>
            </div>
            <Field label="RT" required error={errors.rt}>
              <input className={inputClass} value={form.rt} onChange={set('rt')} />
            </Field>
            <Field label="RW" required error={errors.rw}>
              <input className={inputClass} value={form.rw} onChange={set('rw')} />
            </Field>
            <Field label="Desa / Kelurahan" required error={errors.desa}>
              <input className={inputClass} value={form.desa} onChange={set('desa')} />
            </Field>
            <Field label="Kecamatan" required error={errors.kecamatan}>
              <input className={inputClass} value={form.kecamatan} onChange={set('kecamatan')} />
            </Field>
            <Field label="Kabupaten / Kota" required error={errors.kabupaten}>
              <input className={inputClass} value={form.kabupaten} onChange={set('kabupaten')} />
            </Field>
            <Field label="Provinsi" required error={errors.provinsi}>
              <input className={inputClass} value={form.provinsi} onChange={set('provinsi')} />
            </Field>
            <Field label="No. HP">
              <input
                className={inputClass}
                value={form.nomor_hp}
                onChange={set('nomor_hp')}
                placeholder="Opsional"
              />
            </Field>
          </div>
        </Card>

        {!isEdit && (
          <Card className="mt-4 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-700">Kepala Keluarga</h3>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={withKepala}
                  onChange={(e) => setWithKepala(e.target.checked)}
                  className="h-4 w-4 accent-emerald-600"
                />
                Tambah kepala keluarga
              </label>
            </div>
            {namaError && (
              <div className="mb-4">
                <Alert>{namaError}</Alert>
              </div>
            )}
            {withKepala && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="NIK" required error={errors.nik}>
                  <input
                    className={inputClass}
                    value={kepala.nik}
                    onChange={setKep('nik')}
                    maxLength={16}
                    inputMode="numeric"
                  />
                </Field>
                <Field label="Nama Lengkap" required>
                  <input
                    className={inputClass}
                    value={kepala.nama_lengkap}
                    onChange={setKep('nama_lengkap')}
                  />
                </Field>
                <Field label="Tempat Lahir" required>
                  <input
                    className={inputClass}
                    value={kepala.tempat_lahir}
                    onChange={setKep('tempat_lahir')}
                  />
                </Field>
                <Field label="Tanggal Lahir" required>
                  <input
                    type="date"
                    className={inputClass}
                    value={kepala.tanggal_lahir}
                    onChange={setKep('tanggal_lahir')}
                  />
                </Field>
                <Field label="Jenis Kelamin" required>
                  <select
                    className={inputClass}
                    value={kepala.jenis_kelamin}
                    onChange={setKep('jenis_kelamin')}
                  >
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </Field>
                <Field label="Agama" required>
                  <select className={inputClass} value={kepala.agama} onChange={setKep('agama')}>
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
                  <input
                    className={inputClass}
                    value={kepala.pekerjaan}
                    onChange={setKep('pekerjaan')}
                    placeholder="Opsional"
                  />
                </Field>
                <Field label="No. HP">
                  <input
                    className={inputClass}
                    value={kepala.nomor_hp}
                    onChange={setKep('nomor_hp')}
                    placeholder="Opsional"
                  />
                </Field>
              </div>
            )}
          </Card>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" type="button" onClick={() => navigate(-1)}>
            Batal
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Simpan KK'}
          </Button>
        </div>
      </form>
    </div>
  )
}
