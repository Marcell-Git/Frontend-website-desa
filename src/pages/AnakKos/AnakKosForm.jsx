import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { anakKosApi } from '../../api/index.js'
import { Alert, Button, Card, Field, PageHeader, Spinner, inputClass } from '../../components/ui.jsx'
import ScanCard from '../../components/ScanCard.jsx'
import { errorMessage, fieldErrors } from '../../api/client.js'

const emptyForm = {
  nik: '',
  nama_lengkap: '',
  jenis_kelamin: 'L',
  tanggal_lahir: '',
  agama: '',
  pekerjaan: '',
  nomor_hp: '',
  alamat_asal: '',
  status: true,
}

export default function AnakKosForm() {
  const { id } = useParams()
  const isEdit = !!id
  const navigate = useNavigate()

  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(isEdit)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [errors, setErrors] = useState({})
  const [scanning, setScanning] = useState(false)
  const [scanError, setScanError] = useState('')

  useEffect(() => {
    if (!isEdit) return
    anakKosApi
      .get(id)
      .then((a) =>
        setForm({
          nik: a.nik,
          nama_lengkap: a.nama_lengkap,
          jenis_kelamin: a.jenis_kelamin,
          tanggal_lahir: a.tanggal_lahir,
          agama: a.agama,
          pekerjaan: a.pekerjaan || '',
          nomor_hp: a.nomor_hp || '',
          alamat_asal: a.alamat_asal || '',
          status: a.status,
        }),
      )
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false))
  }, [id, isEdit])

  const set = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: key === 'status' ? e.target.checked : e.target.value }))

  const handleScanFile = async (file) => {
    setError('')
    setScanError('')
    setScanning(true)
    try {
      const fd = new FormData()
      fd.append('foto', file)
      const d = await anakKosApi.ocr(fd)
      setForm((f) => ({
        ...f,
        nik: d.nik || f.nik,
        nama_lengkap: d.nama_lengkap || f.nama_lengkap,
        jenis_kelamin: d.jenis_kelamin === 'P' ? 'P' : d.jenis_kelamin === 'L' ? 'L' : f.jenis_kelamin,
        tanggal_lahir: d.tanggal_lahir || f.tanggal_lahir,
        agama: d.agama || f.agama,
        pekerjaan: d.pekerjaan || f.pekerjaan,
        alamat_asal: d.alamat_asal || f.alamat_asal,
      }))
    } catch (err) {
      setScanError(errorMessage(err))
    } finally {
      setScanning(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setErrors({})
    setSubmitting(true)
    try {
      if (isEdit) {
        await anakKosApi.update(id, {
          nama_lengkap: form.nama_lengkap,
          jenis_kelamin: form.jenis_kelamin,
          agama: form.agama,
          pekerjaan: form.pekerjaan || null,
          nomor_hp: form.nomor_hp || null,
          alamat_asal: form.alamat_asal,
          status: form.status,
        })
        navigate('/anak-kos')
      } else {
        await anakKosApi.create({
          nik: form.nik,
          nama_lengkap: form.nama_lengkap,
          jenis_kelamin: form.jenis_kelamin,
          tanggal_lahir: form.tanggal_lahir,
          agama: form.agama,
          pekerjaan: form.pekerjaan || null,
          nomor_hp: form.nomor_hp || null,
          alamat_asal: form.alamat_asal,
          status: form.status,
        })
        navigate('/anak-kos')
      }
    } catch (err) {
      setError(errorMessage(err))
      setErrors(fieldErrors(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <Spinner />

  return (
    <div className="max-w-3xl">
      <PageHeader
        title={isEdit ? 'Ubah Data Anak Kos' : 'Tambah Anak Kos'}
        description={isEdit ? 'Perbarui data anak kos' : 'Isi data anak kos baru'}
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

      {!isEdit && (
        <ScanCard
          title="Scan KTP Anak Kos"
          description="Ambil foto KTP, datanya akan terisi otomatis. Periksa kembali hasilnya sebelum menyimpan."
          label="Ambil Foto KTP"
          scanning={scanning}
          error={scanError}
          onFile={handleScanFile}
        />
      )}

      <form onSubmit={handleSubmit}>
        <Card className="p-6">
          <h3 className="mb-4 text-sm font-semibold text-slate-700">Data Diri (Sesuai KTP)</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {!isEdit && (
              <Field label="NIK" required error={errors.nik}>
                <input
                  className={inputClass}
                  value={form.nik}
                  onChange={set('nik')}
                  maxLength={16}
                  inputMode="numeric"
                  placeholder="16 digit angka"
                />
              </Field>
            )}
            <Field label="Nama Lengkap" required error={errors.nama_lengkap}>
              <input className={inputClass} value={form.nama_lengkap} onChange={set('nama_lengkap')} />
            </Field>
            <Field label="Jenis Kelamin" required error={errors.jenis_kelamin}>
              <select className={inputClass} value={form.jenis_kelamin} onChange={set('jenis_kelamin')}>
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
            </Field>
            <Field label="Tanggal Lahir" required error={errors.tanggal_lahir}>
              <input
                type="date"
                className={inputClass}
                value={form.tanggal_lahir}
                onChange={set('tanggal_lahir')}
              />
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
            <Field label="Pekerjaan" error={errors.pekerjaan}>
              <input className={inputClass} value={form.pekerjaan} onChange={set('pekerjaan')} />
            </Field>
            <Field label="No. HP" error={errors.nomor_hp}>
              <input className={inputClass} value={form.nomor_hp} onChange={set('nomor_hp')} />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Alamat Asal" required error={errors.alamat_asal}>
                <textarea
                  className={inputClass}
                  value={form.alamat_asal}
                  onChange={set('alamat_asal')}
                  rows={2}
                  placeholder="Alamat lengkap sesuai KTP"
                />
              </Field>
            </div>
            {!isEdit && (
              <Field label="Status">
                <label className="flex items-center gap-2 pt-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={form.status}
                    onChange={set('status')}
                    className="h-4 w-4 accent-emerald-600"
                  />
                  Aktif sebagai anak kos
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
            {submitting ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Simpan Anak Kos'}
          </Button>
        </div>
      </form>
    </div>
  )
}
