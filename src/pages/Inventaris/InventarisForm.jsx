import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { inventarisApi } from '../../api/index.js'
import { Alert, Button, Card, Field, PageHeader, Spinner, inputClass } from '../../components/ui.jsx'
import { errorMessage, fieldErrors } from '../../api/client.js'
import { assetUrl } from '../../api/config.js'
import { getContrastTextColor } from '../LandingPage/format.js'
import { COLOR_PRESETS, KATEGORI_PRESETS, KONDISI_OPTIONS } from './constants.js'

const initialForm = {
  nama_barang: '',
  kategori: '',
  warna_label: '#047857',
  jumlah_barang: 1,
  kondisi_barang: 'baik',
  lokasi_penyimpanan: '',
  penanggung_jawab: '',
  periode_perolehan: '',
  keterangan: '',
}

export default function InventarisForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(isEdit)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [errors, setErrors] = useState({})
  const [fotoFile, setFotoFile] = useState(null)
  const [fotoPreview, setFotoPreview] = useState(null)
  const [hapusFoto, setHapusFoto] = useState(false)

  useEffect(() => {
    if (!isEdit) return
    inventarisApi.get(id)
      .then((item) => {
        setForm({
          nama_barang: item.nama_barang || '',
          kategori: item.kategori || '',
          warna_label: item.warna_label || '#047857',
          jumlah_barang: item.jumlah_barang || 1,
          kondisi_barang: item.kondisi_barang || 'baik',
          lokasi_penyimpanan: item.lokasi_penyimpanan || '',
          penanggung_jawab: item.penanggung_jawab || '',
          periode_perolehan: item.periode_perolehan || '',
          keterangan: item.keterangan || '',
        })
        if (item.foto) setFotoPreview(assetUrl(item.foto))
      })
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false))
  }, [id, isEdit])

  const set = (key) => (e) => setForm((current) => ({ ...current, [key]: e.target.value }))

  const pickFoto = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFotoFile(file)
    setHapusFoto(false)
    setFotoPreview(URL.createObjectURL(file))
  }

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setErrors({})
    setSubmitting(true)

    const fd = new FormData()
    Object.entries(form).forEach(([key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        fd.append(key, String(value))
      }
    })
    if (fotoFile) fd.append('foto', fotoFile)
    if (hapusFoto) fd.append('hapus_foto', '1')

    try {
      if (isEdit) {
        await inventarisApi.update(id, fd)
        toast.success('Barang berhasil diperbarui')
      } else {
        await inventarisApi.create(fd)
        toast.success('Barang berhasil ditambahkan')
      }
      navigate('/kelola-inventaris')
    } catch (err) {
      setError(errorMessage(err))
      setErrors(fieldErrors(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <Spinner />

  return (
    <div className="max-w-2xl">
      <PageHeader title={isEdit ? 'Ubah Barang' : 'Tambah Barang'} description="Data inventaris akan tampil pada halaman publik.">
        <Button variant="secondary" onClick={() => navigate(-1)}>Kembali</Button>
      </PageHeader>
      {error && <div className="mb-4"><Alert>{error}</Alert></div>}
      <form onSubmit={submit}>
        <Card className="p-6">
          <div className="grid gap-4">
            <Field label="Nama Barang" required error={errors.nama_barang}>
              <input className={inputClass} value={form.nama_barang} onChange={set('nama_barang')} placeholder="Contoh: Kursi Lipat" />
            </Field>

            <Field label="Kategori" required error={errors.kategori} hint="Contoh: Perlengkapan Aula, Sound System, Meja & Kursi.">
              <input className={inputClass} list="kategori-inventaris" value={form.kategori} onChange={set('kategori')} placeholder="Pilih atau tulis kategori" />
              <datalist id="kategori-inventaris">
                {KATEGORI_PRESETS.map((p) => <option key={p.kategori} value={p.kategori} />)}
              </datalist>
              <p className="mt-2 text-xs text-slate-400">Rekomendasi cepat:</p>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                {KATEGORI_PRESETS.map((p) => (
                  <button
                    key={p.kategori}
                    type="button"
                    onClick={() => setForm((c) => ({ ...c, kategori: p.kategori, warna_label: p.warna }))}
                    className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-700 transition hover:border-slate-300 hover:bg-white active:scale-95"
                  >
                    <span className="mr-1.5 h-2 w-2 rounded-full" style={{ backgroundColor: p.warna }} />
                    {p.kategori}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Warna Label" error={errors.warna_label}>
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  {COLOR_PRESETS.map((c) => {
                    const isSelected = (form.warna_label || '').toUpperCase() === c.value.toUpperCase()
                    return (
                      <button
                        key={c.value}
                        type="button"
                        title={c.label}
                        onClick={() => setForm((curr) => ({ ...curr, warna_label: c.value }))}
                        className={`group relative flex h-8 w-8 items-center justify-center rounded-full border border-black/10 transition hover:scale-110 focus:outline-none ${
                          isSelected ? 'ring-2 ring-emerald-600 ring-offset-2 scale-110' : ''
                        }`}
                        style={{ backgroundColor: c.value }}
                      >
                        {isSelected && (
                          <svg
                            className="h-4 w-4"
                            style={{ color: getContrastTextColor(c.value) }}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={3}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    )
                  })}
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={form.warna_label || '#047857'}
                    onChange={set('warna_label')}
                    className="h-10 w-12 cursor-pointer rounded-lg border border-slate-300 bg-white p-1"
                    aria-label="Pilih warna label"
                  />
                  <input
                    className={`${inputClass} max-w-32 uppercase font-mono text-xs`}
                    value={form.warna_label}
                    onChange={set('warna_label')}
                    placeholder="#047857"
                    maxLength={7}
                  />
                  <span
                    className="rounded-full px-3 py-1 text-xs font-bold shadow-sm transition-all"
                    style={{ backgroundColor: form.warna_label || '#047857', color: getContrastTextColor(form.warna_label || '#047857') }}
                  >
                    {form.kategori || 'Pratinjau label'}
                  </span>
                </div>
              </div>
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Jumlah Barang" required error={errors.jumlah_barang}>
                <input type="number" min={1} className={inputClass} value={form.jumlah_barang} onChange={set('jumlah_barang')} placeholder="1" />
              </Field>
              <Field label="Kondisi Barang" required error={errors.kondisi_barang}>
                <select className={inputClass} value={form.kondisi_barang} onChange={set('kondisi_barang')}>
                  {KONDISI_OPTIONS.map((k) => (
                    <option key={k.value} value={k.value}>{k.label}</option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Lokasi Penyimpanan" error={errors.lokasi_penyimpanan} hint="Opsional">
                <input className={inputClass} value={form.lokasi_penyimpanan} onChange={set('lokasi_penyimpanan')} placeholder="Contoh: Balai RT 26" />
              </Field>
              <Field label="Penanggung Jawab" error={errors.penanggung_jawab} hint="Opsional">
                <input className={inputClass} value={form.penanggung_jawab} onChange={set('penanggung_jawab')} placeholder="Contoh: Ketua RT" />
              </Field>
            </div>

            <Field label="Periode Perolehan" error={errors.periode_perolehan} hint="Bulan dan tahun barang diperoleh. Opsional.">
              <input type="month" className={inputClass} value={form.periode_perolehan} onChange={set('periode_perolehan')} />
            </Field>

            <Field label="Foto Barang" error={errors.foto}>
              <div className="space-y-3">
                {fotoPreview && !hapusFoto ? (
                  <div className="flex items-start gap-4">
                    <img src={fotoPreview} alt="Pratinjau" className="h-28 w-28 rounded-xl border border-slate-200 object-cover" />
                    <div className="flex flex-col gap-2">
                      <label className="cursor-pointer text-xs font-medium text-emerald-700 hover:underline">
                        Ganti foto
                        <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={pickFoto} />
                      </label>
                      {isEdit && (
                        <button type="button" onClick={() => { setHapusFoto(true); setFotoPreview(null); setFotoFile(null) }} className="self-start text-xs font-medium text-red-600 hover:underline">
                          Hapus foto
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-sm text-slate-500 transition hover:border-emerald-400 hover:bg-emerald-50/40">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h2l2-2h6l2 2h2a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m-3-3h6" />
                    </svg>
                    Unggah foto (JPG, PNG, WEBP - maks. 5 MB)
                    <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={pickFoto} />
                  </label>
                )}
                {fotoPreview && (
                  <p className="text-xs text-emerald-700">Foto baru siap disimpan.</p>
                )}
              </div>
            </Field>

            <Field label="Keterangan" error={errors.keterangan} hint="Opsional">
              <textarea className={inputClass} rows={4} value={form.keterangan} onChange={set('keterangan')} placeholder="Tambah catatan bila perlu..." />
            </Field>
          </div>
        </Card>
        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Batal</Button>
          <Button type="submit" disabled={submitting}>{submitting ? 'Menyimpan...' : 'Simpan'}</Button>
        </div>
      </form>
    </div>
  )
}