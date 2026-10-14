import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { FaTrashCan } from 'react-icons/fa6'
import { pengurusApi } from '../../api/index.js'
import { assetUrl } from '../../api/config.js'
import { Alert, Button, Card, PageHeader, Spinner, inputClass } from '../../components/ui.jsx'
import { useAuth } from '../../auth/AuthContext.jsx'
import { errorMessage, fieldErrors } from '../../api/client.js'

const STRUKTUR_AWAL = [
  'Ketua RT',
  'Sekretaris 1',
  'Sekretaris 2',
  'Bendahara 1',
  'Bendahara 2',
  'Seksi Humas 1',
  'Seksi Humas 2',
  'Seksi Pembangunan',
  'Seksi Penerangan',
  'Seksi Keamanan & Ketertiban',
]

let sequence = 0
const nextKey = () => `baris-${Date.now().toString(36)}-${(sequence += 1)}`

function emptyRow(jabatan = '') {
  return { key: nextKey(), id: '', jabatan, nama_lengkap: '', foto: null, fotoFile: null, fotoUrl: null, hapusFoto: false }
}

function rowFromItem(item) {
  return {
    key: nextKey(),
    id: item.id,
    jabatan: item.jabatan || '',
    nama_lengkap: item.nama_lengkap || '',
    foto: item.foto || null,
    fotoFile: null,
    fotoUrl: null,
    hapusFoto: false,
  }
}

// Kolom baris pengurus: No | Jabatan | Nama (lebih lebar) | Foto | Aksi.
// Foto dan Aksi diberi lebar tetap agar kolom sejajar antarbaris.
const ROW_GRID = 'md:grid-cols-[2rem_minmax(0,1fr)_minmax(0,1.4fr)_9.5rem_8.25rem] md:gap-4'

function getInitials(name) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  const first = parts[0] || ''
  const last = parts.length > 1 ? parts[parts.length - 1] : ''
  return (first[0] || '') + (last[0] || '')
}

function FotoPicker({ row, disabled, onChange, onClear }) {
  const src = row.fotoUrl || (row.foto && !row.hapusFoto ? assetUrl(row.foto) : null)

  if (src) {
    return (
      <div className="flex items-center gap-2">
        <img src={src} alt={row.nama_lengkap || row.jabatan} className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-emerald-100" />
        <div className="flex flex-col gap-0.5">
          <label className="cursor-pointer text-xs font-medium text-emerald-700 hover:underline">
            Ganti
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              disabled={disabled}
              onChange={(e) => onChange(e.target.files?.[0] || null)}
            />
          </label>
          <button type="button" onClick={onClear} disabled={disabled} className="text-left text-xs font-medium text-red-600 hover:underline disabled:opacity-50">
            Hapus
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500">
        {getInitials(row.nama_lengkap)}
      </span>
      <label className={`rounded-full px-3 py-1.5 text-xs font-medium ${disabled ? 'cursor-not-allowed bg-slate-100 text-slate-400' : 'cursor-pointer bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
        Unggah
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          disabled={disabled}
          onChange={(e) => onChange(e.target.files?.[0] || null)}
        />
      </label>
    </div>
  )
}

export default function PengurusList() {
  const { can } = useAuth()
  const canSave = can('pengurus:create') && can('pengurus:update') && can('pengurus:delete')
  const [rows, setRows] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [errors, setErrors] = useState({})
  const rowsRef = useRef([])

  useEffect(() => {
    rowsRef.current = rows || []
  })

  useEffect(
    () => () => {
      rowsRef.current.forEach((row) => row.fotoUrl && URL.revokeObjectURL(row.fotoUrl))
    },
    [],
  )

  const load = useCallback(() => {
    setLoading(true)
    pengurusApi
      .all()
      .then((items) =>
        setRows(items.length === 0 ? STRUKTUR_AWAL.map((j) => emptyRow(j)) : items.map(rowFromItem)),
      )
      .catch((err) => {
        setRows([])
        setError(errorMessage(err))
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const patch = (key, changes) =>
    setRows((current) => current.map((row) => (row.key === key ? { ...row, ...changes } : row)))

  const addRow = () => setRows((current) => [...current, emptyRow()])

  const removeRow = (key) => setRows((current) => current.filter((row) => row.key !== key))

  const move = (index, delta) =>
    setRows((current) => {
      const target = index + delta
      if (target < 0 || target >= current.length) return current
      const next = [...current]
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })

  const pickFoto = (row, file) => {
    if (row.fotoUrl) URL.revokeObjectURL(row.fotoUrl)
    patch(row.key, { fotoFile: file, fotoUrl: file ? URL.createObjectURL(file) : null, hapusFoto: false })
  }

  const clearFoto = (row) => {
    if (row.fotoUrl) URL.revokeObjectURL(row.fotoUrl)
    patch(row.key, { foto: null, fotoFile: null, fotoUrl: null, hapusFoto: true })
  }

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setErrors({})
    setSaving(true)

    const filled = []
    rows.forEach((row, index) => {
      if (row.jabatan.trim() || row.nama_lengkap.trim()) filled.push({ row, index })
    })

    const fd = new FormData()
    fd.append(
      'rows',
      JSON.stringify(
        filled.map(({ row }, urutan) => ({
          key: row.key,
          id: row.id,
          jabatan: row.jabatan.trim(),
          nama_lengkap: row.nama_lengkap.trim(),
          urutan,
          hapus_foto: row.hapusFoto,
        })),
      ),
    )
    filled.forEach(({ row }) => {
      if (row.fotoFile) fd.append(`foto_${row.key}`, row.fotoFile)
    })

    try {
      const saved = await pengurusApi.saveAll(fd)
      rows.forEach((row) => row.fotoUrl && URL.revokeObjectURL(row.fotoUrl))
      setRows(saved.map(rowFromItem))
      toast.success('Susunan pengurus berhasil disimpan')
    } catch (err) {
      setError(errorMessage(err))
      setErrors(fieldErrors(err))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Spinner />

  // Server validation errors are keyed by the row's position in the submitted
  // payload, which skips rows the admin left completely blank.
  const payloadOrder = new Map()
  rows.forEach((row, index) => {
    if (row.jabatan.trim() || row.nama_lengkap.trim()) payloadOrder.set(index, payloadOrder.size)
  })

  const rowError = (index, field) => {
    const position = payloadOrder.get(index)
    if (position === undefined) return ''
    const value = errors[`rows.${position}.${field}`]
    return Array.isArray(value) ? value.join(', ') : value
  }

  return (
    <div>
      <PageHeader
        title="Pengurus RT"
        description="Isi tabel jabatan sesuai struktur pengurus RT. Semua perubahan disimpan sekaligus."
      />

      {error && (
        <div className="mb-4">
          <Alert>{error}</Alert>
        </div>
      )}
      {!canSave && (
        <div className="mb-4">
          <Alert type="info">Anda hanya dapat melihat susunan pengurus, belum dapat mengubahnya.</Alert>
        </div>
      )}

      <form onSubmit={submit}>
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4">
            <p className="text-sm text-slate-500">
              {rows.length === 0
                ? 'Belum ada jabatan. Tambahkan minimal satu.'
                : `${rows.length} jabatan. Urutan tabel menentukan urutan tampil di halaman publik.`}
            </p>
            <Button type="button" variant="secondary" onClick={addRow} disabled={!canSave}>
              Tambah Jabatan
            </Button>
          </div>

          {rows.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-slate-400">
              Belum ada jabatan. Klik “Tambah Jabatan” untuk memulai.
            </p>
          ) : (
            <div>
              {/* Baris memakai grid, bukan tabel: kolom tabel menyusut mengikuti
                  lebar bawaan input sehingga kotak Jabatan/Nama tidak penuh. */}
              <div className={`hidden border-b border-slate-100 px-4 py-3 text-xs font-medium uppercase text-slate-500 md:grid ${ROW_GRID}`}>
                <span>No</span>
                <span>Jabatan</span>
                <span>Nama Lengkap</span>
                <span>Foto</span>
                <span className="text-right">Aksi</span>
              </div>
              {rows.map((row, index) => {
                const jabatanError = rowError(index, 'jabatan')
                const namaError = rowError(index, 'nama_lengkap')
                const rowErrorMessage = rowError(index, 'id') || rowError(index, 'foto')
                return (
                  <div
                    key={row.key}
                    className={`grid grid-cols-1 gap-3 border-b border-slate-100 px-4 py-3 last:border-0 md:items-start ${ROW_GRID}`}
                  >
                    <span className="text-xs font-medium text-slate-400 md:pt-3 md:text-sm">
                      <span className="md:hidden">Baris </span>
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <input
                        className={`${inputClass} ${jabatanError ? 'border-red-400' : ''}`}
                        value={row.jabatan}
                        disabled={!canSave}
                        onChange={(e) => patch(row.key, { jabatan: e.target.value })}
                        placeholder="Ketua RT"
                        aria-label={`Jabatan baris ${index + 1}`}
                      />
                      {jabatanError && <p className="mt-1 text-xs text-red-600">{jabatanError}</p>}
                    </div>
                    <div className="min-w-0">
                      <input
                        className={`${inputClass} ${namaError ? 'border-red-400' : ''}`}
                        value={row.nama_lengkap}
                        disabled={!canSave}
                        onChange={(e) => patch(row.key, { nama_lengkap: e.target.value })}
                        placeholder="Nama lengkap"
                        aria-label={`Nama baris ${index + 1}`}
                      />
                      {namaError && <p className="mt-1 text-xs text-red-600">{namaError}</p>}
                    </div>
                    <div className="md:pt-0.5">
                      <FotoPicker
                        row={row}
                        disabled={!canSave}
                        onChange={(file) => pickFoto(row, file)}
                        onClear={() => clearFoto(row)}
                      />
                      {rowErrorMessage && <p className="mt-1 text-xs text-red-600">{rowErrorMessage}</p>}
                    </div>
                    <div className="flex items-center justify-end gap-1 md:pt-1">
                      <button
                        type="button"
                        onClick={() => move(index, -1)}
                        disabled={!canSave || index === 0}
                        aria-label={`Naikkan baris ${index + 1}`}
                        className="flex h-9 w-9 items-center justify-center rounded-full text-xs text-slate-500 ring-1 ring-slate-200 hover:bg-slate-50 disabled:opacity-30"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => move(index, 1)}
                        disabled={!canSave || index === rows.length - 1}
                        aria-label={`Turunkan baris ${index + 1}`}
                        className="flex h-9 w-9 items-center justify-center rounded-full text-xs text-slate-500 ring-1 ring-slate-200 hover:bg-slate-50 disabled:opacity-30"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => removeRow(row.key)}
                        disabled={!canSave}
                        aria-label={`Hapus baris ${index + 1}`}
                        title="Hapus baris"
                        className="flex h-9 w-9 items-center justify-center rounded-full text-rose-500 ring-1 ring-rose-200 hover:bg-rose-50 disabled:opacity-30"
                      >
                        <FaTrashCan className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 p-4">
            <p className="text-xs text-slate-400">Baris yang dibiarkan kosong akan diabaikan saat disimpan.</p>
            <div className="flex gap-2">
              <Button type="button" variant="secondary" onClick={load} disabled={saving || !canSave}>
                Muat ulang
              </Button>
              <Button type="submit" disabled={saving || !canSave}>
                {saving ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </div>
          </div>
        </Card>
      </form>
    </div>
  )
}
