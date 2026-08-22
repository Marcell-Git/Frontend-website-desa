import { useState } from 'react'
import { FaCamera, FaXmark } from 'react-icons/fa6'
import { Alert, Card } from './ui.jsx'

const MAX_SCAN_SIZE = 10 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']

export default function ScanCard({ title, description, label, scanning, error, onFile }) {
  const [preview, setPreview] = useState(null)
  const [localError, setLocalError] = useState('')

  const handleSelect = (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!ALLOWED_TYPES.includes(file.type)) {
      setLocalError('Format foto harus JPG, PNG, WEBP, atau HEIC')
      return
    }
    if (file.size > MAX_SCAN_SIZE) {
      setLocalError('Ukuran foto maksimal 10 MB')
      return
    }
    setLocalError('')
    if (preview) URL.revokeObjectURL(preview)
    setPreview(URL.createObjectURL(file))
    onFile(file)
  }

  const clearPhoto = () => {
    if (preview) URL.revokeObjectURL(preview)
    setPreview(null)
    setLocalError('')
  }

  return (
    <Card className="mb-4 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
          <p className="mt-1 text-xs text-slate-500">{description}</p>
        </div>
        <label
          className={`inline-flex cursor-pointer items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 ${
            scanning ? 'pointer-events-none opacity-60' : ''
          }`}
        >
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleSelect}
            disabled={scanning}
          />
          <FaCamera className="h-4 w-4" />
          {scanning ? 'Memindai...' : preview ? 'Ambil Ulang Foto' : label}
        </label>
      </div>

      {scanning && (
        <div className="mt-4 flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
          Membaca data dari foto, mohon tunggu...
        </div>
      )}

      {(localError || error) && (
        <div className="mt-4">
          <Alert>{localError || error}</Alert>
        </div>
      )}

      {preview && !scanning && (
        <div className="mt-4 flex items-start gap-4">
          <img
            src={preview}
            alt={`Foto ${title}`}
            className="max-h-48 w-auto rounded-lg border border-slate-200"
          />
          <button
            type="button"
            onClick={clearPhoto}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-600"
          >
            <FaXmark className="h-3.5 w-3.5" /> Hapus foto
          </button>
        </div>
      )}
    </Card>
  )
}
