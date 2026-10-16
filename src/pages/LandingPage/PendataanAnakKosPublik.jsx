import { useState } from 'react'
import { anakKosApi } from '../../api/index.js'
import { errorMessage, fieldErrors } from '../../api/client.js'

const emptyForm = {
  nik: '',
  nama_lengkap: '',
  jenis_kelamin: 'L',
  tanggal_lahir: '',
  agama: '',
  pekerjaan: '',
  nomor_hp: '',
  alamat_kos: '',
  alamat_asal: '',
}

const inputCls =
  'w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100'

const points = [
  'Diperuntukkan bagi anak kos, kontrakan, maupun warga yang tinggal sementara di wilayah RT 26.',
  'Data hanya digunakan untuk keperluan pendataan dan pelayanan warga.',
  'Pastikan NIK sesuai KTP agar data tidak tertolak.',
]

export default function PendataanAnakKosPublik() {
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const validate = () => {
    const errs = {}
    if (!/^\d{16}$/.test(form.nik)) errs.nik = 'NIK harus 16 digit angka'
    if (!form.nama_lengkap.trim()) errs.nama_lengkap = 'Nama lengkap wajib diisi'
    if (!form.tanggal_lahir) errs.tanggal_lahir = 'Tanggal lahir wajib diisi'
    if (!form.agama) errs.agama = 'Agama wajib diisi'
    if (!form.alamat_kos.trim()) errs.alamat_kos = 'Alamat kos/kontrakan wajib diisi'
    if (!form.alamat_asal.trim()) errs.alamat_asal = 'Alamat asal wajib diisi'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setErrors({})

    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    setSubmitting(true)
    try {
      await anakKosApi.submit({
        nik: form.nik,
        nama_lengkap: form.nama_lengkap.trim(),
        jenis_kelamin: form.jenis_kelamin,
        tanggal_lahir: form.tanggal_lahir,
        agama: form.agama,
        pekerjaan: form.pekerjaan.trim() || null,
        nomor_hp: form.nomor_hp.trim() || null,
        alamat_kos: form.alamat_kos.trim(),
        alamat_asal: form.alamat_asal.trim(),
      })
      setSuccess(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setErrors(fieldErrors(err))
      setError(errorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  const fieldError = (name) => errors[name]?.[0] || errors[name]

  if (success) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center sm:p-12">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white">
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="mt-5 font-display text-xl font-bold text-emerald-900 sm:text-2xl">
            Pendataan Berhasil Dikirim
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-emerald-800">
            Terima kasih! Data Anda berhasil terkirim dan tercatat dalam pendataan{' '}
            <span className="font-semibold">Anak Kos / Warga Kontrak</span> RT 26. Jika ada koreksi,
            silakan hubungi pengurus RT.
          </p>
          <button
            type="button"
            onClick={() => {
              setSuccess(false)
              setForm(emptyForm)
            }}
            className="mt-6 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
          >
            Kirim Data Lain
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-16" id="pendataan">
      <div className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <h2 className="text-balance font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Pendataan Anak Kos / Warga Kontrak
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            Warga yang tinggal sementara (kos, kontrakan, atau rumah keluarga) di lingkungan RT 26
            diharapkan mengisi data diri agar terdata oleh pengurus RT.
          </p>
          <ul className="mt-6 space-y-3">
            {points.map((text) => (
              <li key={text} className="flex items-start gap-3 text-sm leading-relaxed text-slate-600">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-3">
          <form
            onSubmit={handleSubmit}
            className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
            noValidate
          >
            {error && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
            )}

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="pendataan_nik" className="mb-1 block text-sm font-medium text-slate-700">
                  NIK <span className="ml-0.5 text-red-500">*</span>
                </label>
                <input
                  id="pendataan_nik"
                  name="nik"
                  type="text"
                  inputMode="numeric"
                  maxLength={16}
                  value={form.nik}
                  onChange={handleChange}
                  placeholder="16 digit angka"
                  className={inputCls}
                />
                {fieldError('nik') && <p className="mt-1 text-xs text-red-600">{fieldError('nik')}</p>}
              </div>

              <div>
                <label htmlFor="pendataan_nama" className="mb-1 block text-sm font-medium text-slate-700">
                  Nama Lengkap <span className="ml-0.5 text-red-500">*</span>
                </label>
                <input
                  id="pendataan_nama"
                  name="nama_lengkap"
                  type="text"
                  value={form.nama_lengkap}
                  onChange={handleChange}
                  placeholder="Sesuai KTP"
                  className={inputCls}
                />
                {fieldError('nama_lengkap') && (
                  <p className="mt-1 text-xs text-red-600">{fieldError('nama_lengkap')}</p>
                )}
              </div>

              <div>
                <label htmlFor="pendataan_jk" className="mb-1 block text-sm font-medium text-slate-700">
                  Jenis Kelamin <span className="ml-0.5 text-red-500">*</span>
                </label>
                <select id="pendataan_jk" name="jenis_kelamin" value={form.jenis_kelamin} onChange={handleChange} className={inputCls}>
                  <option value="L">Laki-laki</option>
                  <option value="P">Perempuan</option>
                </select>
              </div>

              <div>
                <label htmlFor="pendataan_tgl" className="mb-1 block text-sm font-medium text-slate-700">
                  Tanggal Lahir <span className="ml-0.5 text-red-500">*</span>
                </label>
                <input
                  id="pendataan_tgl"
                  name="tanggal_lahir"
                  type="date"
                  value={form.tanggal_lahir}
                  onChange={handleChange}
                  className={inputCls}
                />
                {fieldError('tanggal_lahir') && (
                  <p className="mt-1 text-xs text-red-600">{fieldError('tanggal_lahir')}</p>
                )}
              </div>

              <div>
                <label htmlFor="pendataan_agama" className="mb-1 block text-sm font-medium text-slate-700">
                  Agama <span className="ml-0.5 text-red-500">*</span>
                </label>
                <select id="pendataan_agama" name="agama" value={form.agama} onChange={handleChange} className={inputCls}>
                  <option value="">Pilih</option>
                  <option>Islam</option>
                  <option>Kristen</option>
                  <option>Katolik</option>
                  <option>Hindu</option>
                  <option>Buddha</option>
                  <option>Konghucu</option>
                </select>
                {fieldError('agama') && <p className="mt-1 text-xs text-red-600">{fieldError('agama')}</p>}
              </div>

              <div>
                <label htmlFor="pendataan_pekerjaan" className="mb-1 block text-sm font-medium text-slate-700">
                  Pekerjaan
                </label>
                <input
                  id="pendataan_pekerjaan"
                  name="pekerjaan"
                  type="text"
                  value={form.pekerjaan}
                  onChange={handleChange}
                  placeholder="Contoh: Mahasiswa, karyawan..."
                  className={inputCls}
                />
              </div>

              <div>
                <label htmlFor="pendataan_hp" className="mb-1 block text-sm font-medium text-slate-700">
                  No. HP
                </label>
                <input
                  id="pendataan_hp"
                  name="nomor_hp"
                  type="tel"
                  value={form.nomor_hp}
                  onChange={handleChange}
                  placeholder="08xxxxxxxxxx"
                  className={inputCls}
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="pendataan_alamat_kos" className="mb-1 block text-sm font-medium text-slate-700">
                  Alamat Kos / Kontrakan <span className="ml-0.5 text-red-500">*</span>
                </label>
                <textarea
                  id="pendataan_alamat_kos"
                  name="alamat_kos"
                  rows={2}
                  value={form.alamat_kos}
                  onChange={handleChange}
                  placeholder="Alamat tempat tinggal di RT 26 (nama kos/pemilik, nomor rumah)"
                  className={`${inputCls} resize-y`}
                />
                {fieldError('alamat_kos') && (
                  <p className="mt-1 text-xs text-red-600">{fieldError('alamat_kos')}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="pendataan_alamat" className="mb-1 block text-sm font-medium text-slate-700">
                  Alamat Asal <span className="ml-0.5 text-red-500">*</span>
                </label>
                <textarea
                  id="pendataan_alamat"
                  name="alamat_asal"
                  rows={2}
                  value={form.alamat_asal}
                  onChange={handleChange}
                  placeholder="Alamat lengkap sesuai KTP"
                  className={`${inputCls} resize-y`}
                />
                {fieldError('alamat_asal') && (
                  <p className="mt-1 text-xs text-red-600">{fieldError('alamat_asal')}</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {submitting ? 'Mengirim...' : 'Kirim Data Pendataan'}
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}