import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { peraturanApi } from '../../api/index.js'
import { assetUrl } from '../../api/config.js'
import { Alert, Button, Card, Field, FormActions, InfoCard, PageHeader, Spinner, inputClass } from '../../components/ui.jsx'
import { errorMessage, fieldErrors } from '../../api/client.js'

const MAX_SIZE = 10 * 1024 * 1024

const initialForm = { judul: '' }

export default function PeraturanForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(isEdit)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [errors, setErrors] = useState({})
  const [file, setFile] = useState(null)
  const [current, setCurrent] = useState(null)

  useEffect(() => {
    if (!isEdit) return
    peraturanApi.get(id)
      .then((item) => {
        setForm({ judul: item.judul || '' })
        setCurrent(item)
      })
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false))
  }, [id, isEdit])

  const set = (key) => (e) => setForm((v) => ({ ...v, [key]: e.target.value }))

  const pickFile = (e) => {
    const picked = e.target.files?.[0]
    if (!picked) {
      setFile(null)
      return
    }
    if (!/\.pdf$/i.test(picked.name)) {
      setErrors((v) => ({ ...v, file_pdf: ['Format file harus PDF'] }))
      setFile(null)
      return
    }
    if (picked.size > MAX_SIZE) {
      setErrors((v) => ({ ...v, file_pdf: ['Ukuran file maksimal 10 MB'] }))
      setFile(null)
      return
    }
    setErrors((v) => ({ ...v, file_pdf: undefined }))
    setFile(picked)
  }

  const submit = async (e) => {
    e.preventDefault()
    if (isEdit && !file && !form.judul.trim()) {
      setErrors({ judul: ['Judul wajib diisi'] })
      return
    }
    if (!isEdit && !file) {
      setErrors((v) => ({ ...v, file_pdf: ['File PDF wajib diunggah'] }))
      return
    }
    setSubmitting(true)
    setError('')
    const body = new FormData()
    body.append('judul', form.judul)
    if (file) body.append('file_pdf', file)
    try {
      if (isEdit) {
        await peraturanApi.update(id, body)
        toast.success('Peraturan berhasil diperbarui')
      } else {
        await peraturanApi.create(body)
        toast.success('Peraturan berhasil ditambahkan')
      }
      navigate('/kelola-peraturan')
    } catch (err) {
      setError(errorMessage(err))
      setErrors(fieldErrors(err))
      if (fieldErrors(err).file_pdf) setFile(null)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <Spinner />

  return (
    <div>
      <PageHeader
        title={isEdit ? 'Ubah Peraturan' : 'Tambah Peraturan'}
        description="Warga membaca dokumen ini langsung dari halaman publik."
        back="/kelola-peraturan"
      />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="p-6 xl:col-span-2">
          {error && <Alert className="mb-4">{error}</Alert>}
          <form onSubmit={submit} className="space-y-4">
            <Field label="Judul" required error={errors.judul} hint="Contoh: Peraturan RT Nomor 01/2026 tentang Pengelolaan Sampah">
              <input className={inputClass} value={form.judul} onChange={set('judul')} maxLength={200} placeholder="Judul peraturan" />
            </Field>

            {isEdit && current?.file_pdf && !file && (
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">File saat ini</p>
                <a
                  href={assetUrl(current.file_pdf)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-block text-sm font-medium text-emerald-700 hover:underline"
                >
                  Buka PDF
                </a>
                <p className="mt-1 text-xs text-slate-500">Biarkan kosong bila tidak ingin mengganti file.</p>
              </div>
            )}

            <Field
              label="File PDF"
              required={!isEdit}
              error={errors.file_pdf}
              hint="Format PDF, maksimal 10 MB."
            >
              <input
                type="file"
                accept="application/pdf,.pdf"
                onChange={pickFile}
                className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-full file:border-0 file:bg-emerald-700 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-emerald-800"
              />
            </Field>

            {file && (
              <p className="text-xs font-medium text-emerald-700">Dipilih: {file.name}</p>
            )}

            <FormActions>
              <Button type="button" variant="secondary" onClick={() => navigate('/kelola-peraturan')}>Batal</Button>
              <Button type="submit" disabled={submitting}>{submitting ? 'Menyimpan...' : 'Simpan'}</Button>
            </FormActions>
          </form>
        </Card>

        <InfoCard title="Dokumen peraturan">
          <p>Unggah peraturan RT dalam bentuk PDF agar warga bisa membaca dan mengunduhnya dari halaman publik.</p>
          <p>Gunakan judul yang jelas, termasuk nomor dan tahun peraturan.</p>
        </InfoCard>
      </div>
    </div>
  )
}
