import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FaXmark } from 'react-icons/fa6'
import { toast } from 'sonner'
import { kkApi } from '../../api/index.js'
import { Alert, Button, Card, Field, PageHeader, Spinner, inputClass } from '../../components/ui.jsx'
import ScanCard from '../../components/ScanCard.jsx'
import { errorMessage, fieldErrors } from '../../api/client.js'

const emptyForm = {
  nomor_kk: '',
  nomor_hp: '',
  alamat: '',
  rt: '026',
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

const emptyAnggota = {
  nik: '',
  nama_lengkap: '',
  tempat_lahir: '',
  tanggal_lahir: '',
  jenis_kelamin: 'L',
  agama: '',
  pekerjaan: '',
  nomor_hp: '',
  hubungan_keluarga: '',
}

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

export default function KKForm() {
  const { id } = useParams()
  const isEdit = !!id
  const navigate = useNavigate()

  const [form, setForm] = useState(emptyForm)
  const [kepala, setKepala] = useState(emptyKepala)
  const [withKepala, setWithKepala] = useState(true)
  const [anggota, setAnggota] = useState([])
  const [loading, setLoading] = useState(isEdit)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [errors, setErrors] = useState({})
  const [scanning, setScanning] = useState(false)
  const [scanError, setScanError] = useState('')

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
    const members = Array.isArray(d.anggota) ? d.anggota : []
    const kepalaRow = members.find((m) => m.hubungan_keluarga === 'Kepala Keluarga')
    if (kepalaRow && (kepalaRow.nik || kepalaRow.nama_lengkap)) {
      setWithKepala(true)
      setKepala((prev) => ({
        ...prev,
        nik: kepalaRow.nik || prev.nik,
        nama_lengkap: kepalaRow.nama_lengkap || prev.nama_lengkap,
        tempat_lahir: kepalaRow.tempat_lahir || prev.tempat_lahir,
        tanggal_lahir: kepalaRow.tanggal_lahir || prev.tanggal_lahir,
        jenis_kelamin: kepalaRow.jenis_kelamin || prev.jenis_kelamin,
        agama: kepalaRow.agama || prev.agama,
        pekerjaan: kepalaRow.pekerjaan || prev.pekerjaan,
      }))
    }
    const rest = members.filter((m) => m !== kepalaRow && (m.nik || m.nama_lengkap))
    if (rest.length > 0) {
      setAnggota(
        rest.map((m) => ({
          ...emptyAnggota,
          nik: m.nik || '',
          nama_lengkap: m.nama_lengkap || '',
          tempat_lahir: m.tempat_lahir || '',
          tanggal_lahir: m.tanggal_lahir || '',
          jenis_kelamin: m.jenis_kelamin === 'P' ? 'P' : 'L',
          agama: m.agama || '',
          pekerjaan: m.pekerjaan || '',
          hubungan_keluarga: m.hubungan_keluarga || 'Lainnya',
        })),
      )
    }
  }

  const updateAnggota = (i, key, value) =>
    setAnggota((list) => list.map((a, idx) => (idx === i ? { ...a, [key]: value } : a)))

  const removeAnggota = (i) => setAnggota((list) => list.filter((_, idx) => idx !== i))

  const addAnggota = () => setAnggota((list) => [...list, { ...emptyAnggota }])

  const handleScanFile = async (file) => {
    setError('')
    setScanError('')
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
        toast.success('Kartu keluarga berhasil diperbarui')
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
        if (anggota.length > 0) {
          body.anggota = anggota.map((a) => ({
            nik: a.nik,
            nama_lengkap: a.nama_lengkap,
            tempat_lahir: a.tempat_lahir,
            tanggal_lahir: a.tanggal_lahir,
            jenis_kelamin: a.jenis_kelamin,
            agama: a.agama,
            pekerjaan: a.pekerjaan || null,
            nomor_hp: a.nomor_hp || null,
            hubungan_keluarga: a.hubungan_keluarga,
          }))
        }
        const res = await kkApi.create(body)
        toast.success('Kartu keluarga berhasil ditambahkan')
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
    <div>
      <PageHeader
        title={isEdit ? 'Ubah Kartu Keluarga' : 'Tambah Kartu Keluarga'}
        description={isEdit ? 'Perbarui data KK' : 'Isi data kartu keluarga baru'} back />

      {error && (
        <div className="mb-4">
          <Alert>{error}</Alert>
        </div>
      )}

      {!isEdit && (
        <ScanCard
          title="Scan Kartu Keluarga"
          description="Ambil foto KK, datanya akan terisi otomatis. Periksa kembali hasilnya sebelum menyimpan."
          label="Ambil Foto KK"
          scanning={scanning}
          error={scanError}
          onFile={handleScanFile}
        />
      )}

      <form onSubmit={handleSubmit}>
        <Card className="p-6">
          <h3 className="mb-4 text-base font-semibold text-slate-800">Data Kartu Keluarga</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
            <div className="sm:col-span-2">
              <Field label="No. HP">
                <input
                  className={inputClass}
                  value={form.nomor_hp}
                  onChange={set('nomor_hp')}
                  placeholder="Opsional"
                />
              </Field>
            </div>
          </div>
        </Card>

        {!isEdit && (
          <Card className="mt-4 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-800">Kepala Keluarga</h3>
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
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

        {!isEdit && (
          <Card className="mt-4 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-800">Anggota Keluarga Lainnya</h3>
              <Button variant="secondary" size="sm" type="button" onClick={addAnggota}>
                + Tambah Anggota
              </Button>
            </div>
            {anggota.length === 0 ? (
              <p className="text-sm text-slate-400">
                Belum ada anggota. Scan KK atau tambahkan secara manual — anggota lain bisa juga ditambahkan nanti dari halaman detail KK.
              </p>
            ) : (
              <div className="space-y-4">
                {anggota.map((a, i) => (
                  <div key={i} className="rounded-2xl bg-slate-50/70 p-4 ring-1 ring-slate-100">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-500">
                        Anggota {i + 1}
                        {a.nama_lengkap && ` — ${a.nama_lengkap}`}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeAnggota(i)}
                        className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-red-600"
                      >
                        <FaXmark className="h-3.5 w-3.5" /> Hapus
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      <Field label="Hubungan Keluarga" required error={errors[`anggota_${i}_hubungan_keluarga`]}>
                        <select
                          className={inputClass}
                          value={a.hubungan_keluarga}
                          onChange={(e) => updateAnggota(i, 'hubungan_keluarga', e.target.value)}
                        >
                          <option value="">Pilih</option>
                          {hubunganOptions.map((h) => (
                            <option key={h} value={h}>
                              {h}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field label="NIK" required error={errors[`anggota_${i}_nik`]}>
                        <input
                          className={inputClass}
                          value={a.nik}
                          onChange={(e) => updateAnggota(i, 'nik', e.target.value)}
                          maxLength={16}
                          inputMode="numeric"
                        />
                      </Field>
                      <Field label="Nama Lengkap" required error={errors[`anggota_${i}_nama_lengkap`]}>
                        <input
                          className={inputClass}
                          value={a.nama_lengkap}
                          onChange={(e) => updateAnggota(i, 'nama_lengkap', e.target.value)}
                        />
                      </Field>
                      <Field label="Tempat Lahir" required error={errors[`anggota_${i}_tempat_lahir`]}>
                        <input
                          className={inputClass}
                          value={a.tempat_lahir}
                          onChange={(e) => updateAnggota(i, 'tempat_lahir', e.target.value)}
                        />
                      </Field>
                      <Field label="Tanggal Lahir" required error={errors[`anggota_${i}_tanggal_lahir`]}>
                        <input
                          type="date"
                          className={inputClass}
                          value={a.tanggal_lahir}
                          onChange={(e) => updateAnggota(i, 'tanggal_lahir', e.target.value)}
                        />
                      </Field>
                      <Field label="Jenis Kelamin" required error={errors[`anggota_${i}_jenis_kelamin`]}>
                        <select
                          className={inputClass}
                          value={a.jenis_kelamin}
                          onChange={(e) => updateAnggota(i, 'jenis_kelamin', e.target.value)}
                        >
                          <option value="L">Laki-laki</option>
                          <option value="P">Perempuan</option>
                        </select>
                      </Field>
                      <Field label="Agama" required error={errors[`anggota_${i}_agama`]}>
                        <select
                          className={inputClass}
                          value={a.agama}
                          onChange={(e) => updateAnggota(i, 'agama', e.target.value)}
                        >
                          <option value="">Pilih</option>
                          <option>Islam</option>
                          <option>Kristen</option>
                          <option>Katolik</option>
                          <option>Hindu</option>
                          <option>Buddha</option>
                          <option>Konghucu</option>
                        </select>
                      </Field>
                      <Field label="Pekerjaan" error={errors[`anggota_${i}_pekerjaan`]}>
                        <input
                          className={inputClass}
                          value={a.pekerjaan}
                          onChange={(e) => updateAnggota(i, 'pekerjaan', e.target.value)}
                          placeholder="Opsional"
                        />
                      </Field>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* Bar tombol menempel di bawah layar karena form ini panjang */}
        <div className="sticky bottom-4 z-10 mt-4 flex justify-end gap-2 rounded-full bg-white/90 p-2 shadow-lg ring-1 ring-black/5 backdrop-blur">
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
