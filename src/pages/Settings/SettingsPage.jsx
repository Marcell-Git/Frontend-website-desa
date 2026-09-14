import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { settingsApi } from '../../api/index.js'
import { assetUrl } from '../../api/config.js'
import { Alert, Button, Card, Field, PageHeader, Spinner, inputClass } from '../../components/ui.jsx'
import { errorMessage } from '../../api/client.js'

export default function SettingsPage() {
  const [form, setForm] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [uploading, setUploading] = useState('')
  const logoRef = useRef()

  useEffect(() => {
    settingsApi
      .get()
      .then(setForm)
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))
  const toggle = (key) => () => setForm((f) => ({ ...f, [key]: !f[key] }))

  const handleSave = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)
    try {
      const body = {
        nama_website: form.nama_website,
        nama_rt: form.nama_rt,
        desa: form.desa,
        kecamatan: form.kecamatan,
        kabupaten: form.kabupaten,
        provinsi: form.provinsi,
        telepon: form.telepon,
        email: form.email,
        alamat: form.alamat,
        copyright: form.copyright,
        visi: form.visi,
        misi: (form.misi || []).map((item) => item.trim()).filter(Boolean),
        show_pengumuman: form.show_pengumuman,
        show_laporan: form.show_laporan,
        show_pengaduan: form.show_pengaduan,
        show_visi_misi: form.show_visi_misi,
      }
      await settingsApi.update(body)
      toast.success('Pengaturan berhasil disimpan')
      setSuccess('Pengaturan berhasil disimpan')
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const handleUploadLogo = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading('logo')
    try {
      const fd = new FormData()
      fd.append('logo', file)
      const result = await settingsApi.uploadLogo(fd)
      setForm((f) => ({ ...f, logo_path: result.path }))
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setUploading('')
      if (logoRef.current) logoRef.current.value = ''
    }
  }

  const updateMisi = (index, value) => {
    setForm((f) => ({ ...f, misi: (f.misi || []).map((item, i) => (i === index ? value : item)) }))
  }

  const addMisi = () => setForm((f) => ({ ...f, misi: [...(f.misi || []), ''] }))

  const removeMisi = (index) => {
    setForm((f) => ({ ...f, misi: (f.misi || []).filter((_, i) => i !== index) }))
  }

  if (loading) return <Spinner />
  if (!form) return <Alert type="error">Gagal memuat pengaturan</Alert>

  return (
    <div className="max-w-3xl">
      <PageHeader title="Pengaturan Website" description="Konfigurasi informasi dan tampilan website" />

      {error && (
        <div className="mb-4">
          <Alert>{error}</Alert>
        </div>
      )}
      {success && (
        <div className="mb-4">
          <Alert type="success">{success}</Alert>
        </div>
      )}

      <form onSubmit={handleSave}>
        <Card className="mb-6 p-6">
          <h3 className="mb-4 text-sm font-semibold text-slate-900">Informasi Umum</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Nama Website">
              <input className={inputClass} value={form.nama_website || ''} onChange={set('nama_website')} />
            </Field>
            <Field label="Nama RT">
              <input className={inputClass} value={form.nama_rt || ''} onChange={set('nama_rt')} />
            </Field>
            <Field label="Desa">
              <input className={inputClass} value={form.desa || ''} onChange={set('desa')} />
            </Field>
            <Field label="Kecamatan">
              <input className={inputClass} value={form.kecamatan || ''} onChange={set('kecamatan')} />
            </Field>
            <Field label="Kabupaten">
              <input className={inputClass} value={form.kabupaten || ''} onChange={set('kabupaten')} />
            </Field>
            <Field label="Provinsi">
              <input className={inputClass} value={form.provinsi || ''} onChange={set('provinsi')} />
            </Field>
          </div>
        </Card>

        <Card className="mb-6 p-6">
          <h3 className="mb-4 text-sm font-semibold text-slate-900">Kontak</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Telepon">
              <input className={inputClass} value={form.telepon || ''} onChange={set('telepon')} placeholder="0274-xxxxxxx" />
            </Field>
            <Field label="Email">
              <input type="email" className={inputClass} value={form.email || ''} onChange={set('email')} placeholder="email@contoh.com" />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Alamat">
                <textarea className={inputClass} rows={2} value={form.alamat || ''} onChange={set('alamat')} />
              </Field>
            </div>
            <Field label="Copyright">
              <input className={inputClass} value={form.copyright || ''} onChange={set('copyright')} />
            </Field>
          </div>
        </Card>

        <Card className="mb-6 p-6">
          <h3 className="mb-4 text-sm font-semibold text-slate-900">Branding</h3>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Logo</label>
              {form.logo_path && (
                <img
                  src={assetUrl(form.logo_path)}
                  alt="Logo"
                  className="mb-2 h-16 w-auto rounded border border-slate-200 object-contain"
                />
              )}
              <input
                ref={logoRef}
                type="file"
                accept=".png,.jpg,.jpeg,.svg"
                onChange={handleUploadLogo}
                className="text-sm text-slate-600"
              />
              <p className="mt-1 text-xs text-slate-400">PNG, JPG, SVG. Maks 5MB.</p>
              {uploading === 'logo' && <p className="mt-1 text-xs text-blue-600">Mengupload...</p>}
            </div>
          </div>
        </Card>

        <Card className="mb-6 p-6">
          <h3 className="mb-4 text-sm font-semibold text-slate-900">Visibilitas Landing Page</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input type="checkbox" checked={form.show_pengumuman} onChange={toggle('show_pengumuman')} className="h-4 w-4 rounded text-emerald-600" />
              <span className="text-sm text-slate-700">Tampilkan seksi Pengumuman</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" checked={form.show_laporan} onChange={toggle('show_laporan')} className="h-4 w-4 rounded text-emerald-600" />
              <span className="text-sm text-slate-700">Tampilkan seksi Laporan Keuangan</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" checked={form.show_pengaduan} onChange={toggle('show_pengaduan')} className="h-4 w-4 rounded text-emerald-600" />
              <span className="text-sm text-slate-700">Tampilkan seksi Form Pengaduan</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" checked={form.show_visi_misi} onChange={toggle('show_visi_misi')} className="h-4 w-4 rounded text-emerald-600" />
              <span className="text-sm text-slate-700">Tampilkan halaman Visi &amp; Misi</span>
            </label>
          </div>
        </Card>

        <Card className="mb-6 p-6">
          <h3 className="mb-4 text-sm font-semibold text-slate-900">Visi &amp; Misi</h3>
          <div className="space-y-4">
            <Field label="Visi">
              <textarea className={inputClass} rows={3} value={form.visi || ''} onChange={set('visi')} />
            </Field>
            <div>
              <div className="mb-1 flex items-center justify-between gap-3">
                <label className="text-sm font-medium text-slate-700">Misi</label>
                <Button type="button" variant="secondary" size="sm" onClick={addMisi}>Tambah butir</Button>
              </div>
              <div className="space-y-2">
                {(form.misi || []).map((item, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <span className="mt-2.5 w-5 shrink-0 text-right text-sm font-semibold text-emerald-700">{index + 1}.</span>
                    <input className={inputClass} value={item} onChange={(e) => updateMisi(index, e.target.value)} aria-label={`Butir misi ${index + 1}`} />
                    <Button type="button" variant="ghost" size="sm" className="mt-0.5 text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => removeMisi(index)} aria-label={`Hapus butir misi ${index + 1}`}>Hapus</Button>
                  </div>
                ))}
              </div>
              {(form.misi || []).length === 0 && <p className="mt-2 text-xs text-slate-400">Belum ada butir misi. Tambahkan setidaknya satu butir.</p>}
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
          </Button>
        </div>
      </form>
    </div>
  )
}
