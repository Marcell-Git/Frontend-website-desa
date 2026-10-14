import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { settingsApi } from '../../api/index.js'
import { assetUrl } from '../../api/config.js'
import { Alert, Button, Card, Field, PageHeader, Spinner, inputClass } from '../../components/ui.jsx'
import { errorMessage, fieldErrors } from '../../api/client.js'
import { SOCIAL_LINKS } from '../../lib/socialLinks.js'

function toCoordinate(raw) {
  // String kosong (bukan null) dipakai agar backend bisa membedakan
  // "dikosongkan" dari "tidak dikirim" pada field ini.
  if (raw === null || raw === undefined || String(raw).trim() === '') return ''
  const num = Number(raw)
  // Kirim apa adanya bila bukan angka, supaya backend menolak dan nilai lama tidak tersirkap.
  return Number.isFinite(num) ? num : String(raw).trim()
}

function toDMS(value, axis) {
  const num = Number(value)
  if (!Number.isFinite(num) || num === 0) return ''
  const hemisphere = axis === 'lat' ? (num < 0 ? 'S' : 'N') : num < 0 ? 'W' : 'E'
  const abs = Math.abs(num)
  const deg = Math.floor(abs)
  const minFloat = (abs - deg) * 60
  const min = Math.floor(minFloat)
  const sec = (minFloat - min) * 60
  return `${deg}°${min}'${sec.toFixed(1)}"${hemisphere}`
}

export default function SettingsPage() {
  const [form, setForm] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [errors, setErrors] = useState({})
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

  const dmsPreview =
    form && String(form.maps_lat ?? '').trim() !== '' && String(form.maps_lng ?? '').trim() !== ''
      ? [toDMS(form.maps_lat, 'lat'), toDMS(form.maps_lng, 'lng')].filter(Boolean).join('  ')
      : ''

  const handleSave = async (e) => {
    e.preventDefault()
    setError('')
    setErrors({})
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
        maps_lat: toCoordinate(form.maps_lat),
        maps_lng: toCoordinate(form.maps_lng),
        facebook: form.facebook,
        instagram: form.instagram,
        whatsapp: form.whatsapp,
        youtube: form.youtube,
        tiktok: form.tiktok,
        copyright: form.copyright,
        show_pengumuman: form.show_pengumuman,
        show_laporan: form.show_laporan,
        show_pengaduan: form.show_pengaduan,
        show_peraturan: form.show_peraturan,
        show_statistik: form.show_statistik,
      }
      await settingsApi.update(body)
      toast.success('Pengaturan berhasil disimpan')
      setSuccess('Pengaturan berhasil disimpan')
    } catch (err) {
      setError(errorMessage(err))
      setErrors(fieldErrors(err))
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

  if (loading) return <Spinner />
  if (!form) return <Alert type="error">Gagal memuat pengaturan</Alert>

  return (
    <div>
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

      <form onSubmit={handleSave} className="grid grid-cols-1 items-start gap-4 xl:grid-cols-2">
        <Card className="p-6">
          <h3 className="mb-4 text-base font-semibold text-slate-800">Informasi Umum</h3>
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

        <Card className="p-6">
          <h3 className="mb-4 text-base font-semibold text-slate-800">Kontak</h3>
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

        <Card className="p-6">
          <h3 className="mb-1 text-base font-semibold text-slate-800">Titik Peta</h3>
          <p className="mb-4 text-xs text-slate-400">
            Dipakai untuk pin peta di footer halaman publik. Kosongkan keduanya untuk memakai pencarian
            alamat di atas.
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              label="Latitude"
              error={errors.maps_lat}
              hint="Selatan bernilai negatif. Contoh: -7.7122778"
            >
              <input
                type="number"
                step="any"
                inputMode="decimal"
                className={inputClass}
                value={form.maps_lat ?? ''}
                onChange={set('maps_lat')}
                placeholder="-7.7122778"
              />
            </Field>
            <Field
              label="Longitude"
              error={errors.maps_lng}
              hint="Timur bernilai positif. Contoh: 110.5879722"
            >
              <input
                type="number"
                step="any"
                inputMode="decimal"
                className={inputClass}
                value={form.maps_lng ?? ''}
                onChange={set('maps_lng')}
                placeholder="110.5879722"
              />
            </Field>
          </div>
          {dmsPreview && (
            <p className="mt-3 text-xs text-slate-500">
              Titik saat ini: <span className="font-medium text-slate-700">{dmsPreview}</span>
            </p>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="mb-1 text-base font-semibold text-slate-800">Media Sosial</h3>
          <p className="mb-4 text-xs text-slate-400">
            Isi dengan URL lengkap. Link ini muncul sebagai ikon di footer halaman publik. Kosongkan bila
            tidak dipakai.
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {SOCIAL_LINKS.map((item) => (
              <Field key={item.key} label={item.label} error={errors[item.key]}>
                <input
                  type="url"
                  inputMode="url"
                  className={inputClass}
                  value={form[item.key] || ''}
                  onChange={set(item.key)}
                  placeholder={item.placeholder}
                />
              </Field>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="mb-4 text-base font-semibold text-slate-800">Branding</h3>
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

        <Card className="p-6">
          <h3 className="mb-4 text-base font-semibold text-slate-800">Visibilitas Landing Page</h3>
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
              <input type="checkbox" checked={form.show_peraturan} onChange={toggle('show_peraturan')} className="h-4 w-4 rounded text-emerald-600" />
              <span className="text-sm text-slate-700">Tampilkan halaman Peraturan RT</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" checked={form.show_statistik} onChange={toggle('show_statistik')} className="h-4 w-4 rounded text-emerald-600" />
              <span className="text-sm text-slate-700">Tampilkan Statistik Warga di Beranda</span>
            </label>
            <p className="border-t border-slate-100 pt-3 text-xs text-slate-400">
              Tampil/sembunyi halaman Visi &amp; Misi diatur di menu Informasi → Visi &amp; Misi.
            </p>
          </div>
        </Card>

        <div className="sticky bottom-4 z-10 flex justify-end rounded-full bg-white/90 p-2 shadow-lg ring-1 ring-black/5 backdrop-blur xl:col-span-2">
          <Button type="submit" disabled={saving}>
            {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
          </Button>
        </div>
      </form>
    </div>
  )
}
