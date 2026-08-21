import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FaCamera, FaXmark } from 'react-icons/fa6'
import { kkApi } from '../../api/index.js'
import { Alert, Button, Card, Field, PageHeader, Spinner, inputClass } from '../../components/ui.jsx'
import { errorMessage, fieldErrors } from '../../api/client.js'

const MAX_SCAN_SIZE = 10 * 1024 * 1024
const ALLOWED_SCAN_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']

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
  const [scanning, setScanning] = useState(false)
  const [scanError, setScanError] = useState('')
  const [scanPreview, setScanPreview] = useState(null)
  const scanInputRef = useRef(null)

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

  const applyScanResult = (d) => {
    setForm((f) => ({
      ...f,
      nomor_kk: d.nomor_kk || f.nomor_kk,
      alamat: d.alamat || f.alamat,
      rt: d.rt || f.rt,
      rw: d.rw || f.rw,
      desa: d.desa || f.desa,
      kecamatan: d.kecamatan || f.kecamatan,
      kabupaten: d.kabupaten || f.kabupaten,
      provinsi: d.provinsi || f.provinsi,
    }))
    const k = d.kepala_keluarga
    if (k && (k.nik || k.nama_lengkap)) {
      setWithKepala(true)
      setKepala((prev) => ({
        ...prev,
        nik: k.nik || prev.nik,
        nama_lengkap: k.nama_lengkap || prev.nama_lengkap,
        tempat_lahir: k.tempat_lahir || prev.tempat_lahir,
        tanggal_lahir: k.tanggal_lahir || prev.tanggal_lahir,
        jenis_kelamin: k.jenis_kelamin || prev.jenis_kelamin,
        agama: k.agama || prev.agama,
        pekerjaan: k.pekerjaan || prev.pekerjaan,
      }))
    }
  }

  const clearScan = () => {
    if (scanPreview) URL.revokeObjectURL(scanPreview)
    setScanPreview(null)
    setScanError('')
    if (scanInputRef.current) scanInputRef.current.value = ''
  }

  const handleScanChange = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!ALLOWED_SCAN_TYPES.includes(file.type)) {
      setScanError('Format foto harus JPG, PNG, WEBP, atau HEIC')
      return
    }
    if (file.size > MAX_SCAN_SIZE) {
      setScanError('Ukuran foto maksimal 10 MB')
      return
    }
    setError('')
    setScanError('')
    if (scanPreview) URL.revokeObjectURL(scanPreview)
    setScanPreview(URL.createObjectURL(file))
    setScanning(true)
    try {
      const fd = new FormData()
      fd.append('foto', file)
      const data = await kkApi.ocr(fd)
      applyScanResult(data)
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
      const fe = fieldErrors(err)
      setErrors(fe)
      setError(Object.keys(fe).length > 0 ? '' : errorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <Spinner />

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

      {!isEdit && (
        <Card className="mb-4 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-slate-700">Scan Kartu Keluarga</h3>
              <p className="mt-1 text-xs text-slate-500">
                Ambil foto KK, datanya akan terisi otomatis. Periksa kembali hasilnya sebelum menyimpan.
              </p>
            </div>
            <label
              className={`inline-flex cursor-pointer items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 ${
                scanning ? 'pointer-events-none opacity-60' : ''
              }`}
            >
              <input
                ref={scanInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleScanChange}
                disabled={scanning}
              />
              <FaCamera className="h-4 w-4" />
              {scanning ? 'Memindai...' : scanPreview ? 'Ambil Ulang Foto' : 'Ambil Foto KK'}
            </label>
          </div>

          {scanning && (
            <div className="mt-4 flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
              Membaca data dari foto KK, mohon tunggu...
            </div>
          )}

          {scanError && (
            <div className="mt-4">
              <Alert>{scanError}</Alert>
            </div>
          )}

          {scanPreview && !scanning && (
            <div className="mt-4 flex items-start gap-4">
              <img
                src={scanPreview}
                alt="Foto Kartu Keluarga"
                className="max-h-48 w-auto rounded-lg border border-slate-200"
              />
              <button
                type="button"
                onClick={clearScan}
                className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-600"
              >
                <FaXmark className="h-3.5 w-3.5" /> Hapus foto
              </button>
            </div>
          )}
        </Card>
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
