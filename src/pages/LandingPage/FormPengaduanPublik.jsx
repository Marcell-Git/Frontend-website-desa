import { useState } from 'react'
import { Link } from 'react-router-dom'
import { pengaduanApi } from '../../api/index.js'
import { errorMessage, fieldErrors } from '../../api/client.js'
import { usePublicSettings } from '../../components/PublicLayout.jsx'

const MAX_FILE_SIZE = 10 * 1024 * 1024
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'application/pdf',
  'video/mp4',
]

const initialForm = {
  nama_pelapor: '',
  lokasi: '',
  keterangan: '',
}

export default function FormPengaduanPublik() {
  const { settings } = usePublicSettings()
  const [form, setForm] = useState(initialForm)
  const [bukti, setBukti] = useState(null)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  if (!settings) return null

  if (!settings.show_pengaduan) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center text-sm text-slate-500">
        Formulir pengaduan sedang ditutup.
      </div>
    )
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) {
      setBukti(null)
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      setErrors((prev) => ({ ...prev, bukti: ['Ukuran file maksimal 10 MB'] }))
      e.target.value = ''
      return
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        bukti: ['Format file harus JPG, JPEG, PNG, PDF, atau MP4'],
      }))
      e.target.value = ''
      return
    }
    setErrors((prev) => ({ ...prev, bukti: undefined }))
    setBukti(file)
  }

  const validate = () => {
    const errs = {}
    if (!form.nama_pelapor.trim()) errs.nama_pelapor = ['Nama wajib diisi']
    if (!form.lokasi.trim()) errs.lokasi = ['Lokasi wajib diisi']
    if (!form.keterangan.trim()) errs.keterangan = ['Keterangan wajib diisi']
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    const formData = new FormData()
    formData.append('nama_pelapor', form.nama_pelapor.trim())
    formData.append('lokasi', form.lokasi.trim())
    formData.append('keterangan', form.keterangan.trim())
    if (bukti) formData.append('bukti', bukti)

    setSubmitting(true)
    try {
      await pengaduanApi.submit(formData)
      setSuccess(true)
    } catch (err) {
      setErrors(fieldErrors(err))
      setError(errorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-8 text-center sm:p-12">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white">
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="mt-5 text-xl font-bold text-emerald-900">Pengaduan Berhasil Dikirim</h1>
          <p className="mt-2 text-sm leading-relaxed text-emerald-800">
            Terima kasih telah menyampaikan laporan Anda. Pengaduan akan segera ditindaklanjuti oleh
            pengurus RT dengan status awal <span className="font-semibold">Menunggu</span>.
          </p>
          <button
            type="button"
            onClick={() => {
              setSuccess(false)
              setForm(initialForm)
              setBukti(null)
            }}
            className="mt-6 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
          >
            Kirim Pengaduan Lain
          </button>
        </div>
      </div>
    )
  }

  const fieldError = (name) => errors[name]?.[0]

  const inputCls =
    'w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100'

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900">Form Pengaduan Masyarakat</h1>
      <p className="mt-1 text-sm text-slate-500">
        Sampaikan keluhan atau laporan Anda kepada pengurus RT. Tidak perlu login.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8" noValidate>
        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <div>
          <label htmlFor="nama_pelapor" className="mb-1 block text-sm font-medium text-slate-700">
            Nama Lengkap <span className="ml-0.5 text-red-500">*</span>
          </label>
          <input
            id="nama_pelapor"
            name="nama_pelapor"
            type="text"
            value={form.nama_pelapor}
            onChange={handleChange}
            placeholder="Nama Anda"
            className={inputCls}
          />
          {fieldError('nama_pelapor') && (
            <p className="mt-1 text-xs text-red-600">{fieldError('nama_pelapor')}</p>
          )}
        </div>

        <div>
          <label htmlFor="lokasi" className="mb-1 block text-sm font-medium text-slate-700">
            Lokasi Kejadian <span className="ml-0.5 text-red-500">*</span>
          </label>
          <input
            id="lokasi"
            name="lokasi"
            type="text"
            value={form.lokasi}
            onChange={handleChange}
            placeholder="Contoh: Depan balai RT / Gang 3"
            className={inputCls}
          />
          {fieldError('lokasi') && (
            <p className="mt-1 text-xs text-red-600">{fieldError('lokasi')}</p>
          )}
        </div>

        <div>
          <label htmlFor="keterangan" className="mb-1 block text-sm font-medium text-slate-700">
            Keterangan <span className="ml-0.5 text-red-500">*</span>
          </label>
          <textarea
            id="keterangan"
            name="keterangan"
            rows={5}
            value={form.keterangan}
            onChange={handleChange}
            placeholder="Jelaskan pengaduan Anda sedetail mungkin"
            className={`${inputCls} resize-y`}
          />
          {fieldError('keterangan') && (
            <p className="mt-1 text-xs text-red-600">{fieldError('keterangan')}</p>
          )}
        </div>

        <div>
          <label htmlFor="bukti" className="mb-1 block text-sm font-medium text-slate-700">
            Bukti (opsional)
          </label>
          <input
            id="bukti"
            name="bukti"
            type="file"
            accept=".jpg,.jpeg,.png,.pdf,.mp4"
            onChange={handleFileChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-emerald-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-emerald-700 hover:file:bg-emerald-100"
          />
          <p className="mt-1 text-xs text-slate-400">
            Format JPG, JPEG, PNG, PDF, atau MP4. Ukuran maksimal 10 MB.
          </p>
          {fieldError('bukti') && (
            <p className="mt-1 text-xs text-red-600">{fieldError('bukti')}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {submitting ? 'Mengirim...' : 'Kirim Pengaduan'}
        </button>
      </form>

      <p className="mt-4 text-center text-xs text-slate-400">
        Butuh bantuan? Hubungi pengurus melalui halaman{' '}
        <Link to="/kontak" className="font-medium text-emerald-700 hover:underline">
          Kontak
        </Link>
        .
      </p>
    </div>
  )
}
