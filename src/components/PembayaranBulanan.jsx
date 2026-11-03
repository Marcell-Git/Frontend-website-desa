import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  Badge,
  Button,
  Card,
  ConfirmModal,
  EmptyState,
  Field,
  TableSkeleton,
  inputClass,
  toolbarClass,
  toolbarFieldClass,
  toolbarSearchClass,
} from './ui.jsx'
import { errorMessage } from '../api/client.js'
import { useAuth } from '../auth/AuthContext.jsx'
import { formatTanggal } from '../lib/tanggal.js'

export const formatRupiah = (n) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n || 0)

export const NAMA_BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

const pad = (n) => String(n).padStart(2, '0')

/** Periode bulan berjalan dalam format YYYY-MM. */
export function periodeSekarang() {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`
}

/** Contoh: "2026-10" → "Oktober 2026". */
export function labelPeriode(periode) {
  if (!periode) return '-'
  const [y, m] = periode.split('-').map(Number)
  return `${NAMA_BULAN[m - 1]} ${y}`
}

function geserPeriode(periode, delta) {
  const [y, m] = periode.split('-').map(Number)
  const d = new Date(y, m - 1 + delta, 1)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`
}

function hariIni() {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

// Pemilih bulan & tahun dengan tombol bulan sebelumnya/berikutnya.
export function PeriodePicker({ value, onChange }) {
  const [tahun, bulan] = value.split('-').map(Number)
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 7 }, (_, i) => currentYear + 1 - i)
  if (!years.includes(tahun)) years.push(tahun)

  const navBtn =
    'flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-slate-600 ring-1 ring-slate-200 transition-colors hover:bg-slate-50'

  return (
    <div className="flex items-center gap-2">
      <button type="button" className={navBtn} onClick={() => onChange(geserPeriode(value, -1))} aria-label="Bulan sebelumnya">
        ‹
      </button>
      <select
        className={`${toolbarFieldClass} sm:min-w-36`}
        value={bulan}
        onChange={(e) => onChange(`${tahun}-${pad(e.target.value)}`)}
        aria-label="Bulan"
      >
        {NAMA_BULAN.map((m, i) => (
          <option key={m} value={i + 1}>{m}</option>
        ))}
      </select>
      <select
        className={`${toolbarFieldClass} sm:min-w-28`}
        value={tahun}
        onChange={(e) => onChange(`${e.target.value}-${pad(bulan)}`)}
        aria-label="Tahun"
      >
        {years.sort((a, b) => b - a).map((y) => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>
      <button type="button" className={navBtn} onClick={() => onChange(geserPeriode(value, 1))} aria-label="Bulan berikutnya">
        ›
      </button>
    </div>
  )
}

function StatCard({ label, value, hint, tone = 'slate' }) {
  const tones = {
    slate: 'text-slate-900',
    green: 'text-emerald-700',
    red: 'text-rose-600',
  }
  return (
    <Card className="p-5">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</div>
      <div className={`mt-1.5 text-2xl font-semibold tracking-tight ${tones[tone]}`}>{value}</div>
      {hint && <div className="mt-1 text-xs text-slate-500">{hint}</div>}
    </Card>
  )
}

/**
 * Daftar seluruh KK beserta status bayar untuk satu tagihan bulanan.
 * - fetchList(params) → { data, ringkasan }
 * - konfirmasi({ kartu_keluarga_id, periode, tanggal_bayar })
 * - batal(pembayaranId)
 * - exportPdf() / exportExcel()
 */
export default function PembayaranBulanan({
  periode,
  namaTagihan,
  permissionPrefix,
  fetchList,
  konfirmasi,
  batal,
  exportPdf,
  exportExcel,
  onChanged,
}) {
  const { can } = useAuth()
  const [data, setData] = useState({ data: [], ringkasan: null })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')
  const [status, setStatus] = useState('')
  const [exporting, setExporting] = useState('')
  const [toConfirm, setToConfirm] = useState(null)
  const [tanggalBayar, setTanggalBayar] = useState(hariIni())
  const [nominalBayar, setNominalBayar] = useState('')
  const [toCancel, setToCancel] = useState(null)
  const [saving, setSaving] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    fetchList({ periode, status: status || undefined, search: appliedSearch || undefined })
      .then((res) => setData({ data: res?.data ?? [], ringkasan: res?.ringkasan ?? null }))
      .catch((err) => {
        setData({ data: [], ringkasan: null })
        setError(errorMessage(err))
      })
      .finally(() => setLoading(false))
  }, [fetchList, periode, status, appliedSearch])

  useEffect(() => {
    load()
  }, [load])

  const handleExport = async (type, fn) => {
    setExporting(type)
    try {
      await fn()
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setExporting('')
    }
  }

  const r = data.ringkasan
  const nominal = r?.nominal_tagihan ?? 0
  const persen = r && r.total_kk > 0 ? Math.round((r.sudah_bayar / r.total_kk) * 100) : 0

  const openConfirm = (item) => {
    setTanggalBayar(hariIni())
    setNominalBayar(String(nominal))
    setToConfirm(item)
  }

  const handleKonfirmasi = async () => {
    setSaving(true)
    try {
      await konfirmasi({
        kartu_keluarga_id: toConfirm.kartu_keluarga_id,
        periode,
        tanggal_bayar: tanggalBayar,
        nominal: Number(nominalBayar),
      })
      toast.success(`Pembayaran ${toConfirm.nama_kepala_keluarga || toConfirm.nomor_kk} dikonfirmasi`)
      setToConfirm(null)
      load()
      onChanged?.()
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const handleBatal = async () => {
    setSaving(true)
    try {
      await batal(toCancel.pembayaran_id)
      toast.success('Konfirmasi pembayaran dibatalkan')
      setToCancel(null)
      load()
      onChanged?.()
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const dibayar = Number(nominalBayar) || 0
  const kurang = dibayar < nominal
  const lebih = dibayar - nominal

  const nama = (item) => item.nama_kepala_keluarga || <span className="text-slate-400">Kepala belum diatur</span>

  return (
    <div className="space-y-4">
      {r && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            label="Sudah bayar"
            tone="green"
            value={`${r.sudah_bayar} / ${r.total_kk} KK`}
            hint={
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-emerald-600 transition-all" style={{ width: `${persen}%` }} />
              </div>
            }
          />
          <StatCard label="Belum bayar" tone={r.belum_bayar > 0 ? 'red' : 'slate'} value={`${r.belum_bayar} KK`} hint={`Tagihan ${formatRupiah(nominal)} per KK`} />
          <StatCard
            label="Terkumpul"
            value={formatRupiah(r.total_terkumpul)}
            hint={
              r.total_kelebihan > 0
                ? `termasuk kelebihan ${formatRupiah(r.total_kelebihan)} · target ${formatRupiah(nominal * r.total_kk)}`
                : `dari ${formatRupiah(nominal * r.total_kk)} · ${labelPeriode(periode)}`
            }
          />
        </div>
      )}

      <Card>
        <div className="border-b border-slate-100 p-4">
          <form
            className={toolbarClass}
            onSubmit={(e) => {
              e.preventDefault()
              setAppliedSearch(search)
            }}
          >
            <input
              className={toolbarSearchClass}
              placeholder="Cari kepala keluarga, No. KK, alamat..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button variant="secondary" type="submit">
              Cari
            </Button>
            <select
              className={toolbarFieldClass}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              aria-label="Status pembayaran"
            >
              <option value="">Semua Status</option>
              <option value="belum">Belum Bayar</option>
              <option value="lunas">Sudah Bayar</option>
            </select>
            {can(`${permissionPrefix}:export`) && (
              <div className="flex gap-2 lg:ml-auto">
                <Button type="button" variant="secondary" size="sm" disabled={!!exporting} onClick={() => handleExport('pdf', exportPdf)}>
                  {exporting === 'pdf' ? 'Download...' : 'Export PDF'}
                </Button>
                <Button type="button" size="sm" disabled={!!exporting} onClick={() => handleExport('excel', exportExcel)}>
                  {exporting === 'excel' ? 'Download...' : 'Export Excel'}
                </Button>
              </div>
            )}
          </form>
        </div>

        {error && <div className="p-4 text-sm text-red-600">{error}</div>}
        {loading ? (
          <TableSkeleton cols={5} />
        ) : data.data.length === 0 ? (
          !error && <EmptyState message="Tidak ada kartu keluarga yang cocok." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                  <th className="px-4 py-3">Kepala Keluarga</th>
                  <th className="px-4 py-3">Alamat</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Nominal</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((item) => (
                  <tr key={item.kartu_keluarga_id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{nama(item)}</div>
                      <div className="text-xs text-slate-500">No. KK {item.nomor_kk}</div>
                    </td>
                    <td className="max-w-[220px] truncate px-4 py-3 text-slate-600">{item.alamat || '-'}</td>
                    <td className="px-4 py-3">
                      {item.lunas ? (
                        <div className="flex flex-col items-start gap-1">
                          <Badge color="green">Sudah bayar</Badge>
                          <span className="text-xs text-slate-500">{formatTanggal(item.tanggal_bayar)}</span>
                        </div>
                      ) : (
                        <Badge color="red">Belum bayar</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-slate-700">
                      {item.lunas ? (
                        <>
                          {formatRupiah(item.nominal)}
                          {item.nominal > item.nominal_tagihan && (
                            <div className="text-xs font-normal text-emerald-700">
                              lebih {formatRupiah(item.nominal - item.nominal_tagihan)}
                            </div>
                          )}
                        </>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {item.lunas
                        ? can(`${permissionPrefix}:delete`) && (
                            <Button size="sm" variant="ghost" onClick={() => setToCancel(item)}>
                              Batalkan
                            </Button>
                          )
                        : can(`${permissionPrefix}:create`) && (
                            <Button size="sm" onClick={() => openConfirm(item)} disabled={nominal <= 0}>
                              Konfirmasi
                            </Button>
                          )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <ConfirmModal
        open={!!toConfirm}
        title="Konfirmasi Pembayaran"
        message={
          toConfirm
            ? `${toConfirm.nama_kepala_keluarga || `KK ${toConfirm.nomor_kk}`} membayar ${namaTagihan} ${labelPeriode(periode)}. Tagihan ${formatRupiah(nominal)}.`
            : ''
        }
        onConfirm={() => {
          if (kurang) {
            toast.error(`Nominal dibayar tidak boleh kurang dari ${formatRupiah(nominal)}`)
            return
          }
          handleKonfirmasi()
        }}
        onCancel={() => setToConfirm(null)}
        loading={saving}
        confirmText="Konfirmasi"
        danger={false}
      >
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            label="Nominal dibayar (Rp)"
            required
            error={kurang ? `Minimal ${formatRupiah(nominal)}` : undefined}
            hint={lebih > 0 ? `Lebih ${formatRupiah(lebih)} dari tagihan` : 'Boleh lebih dari tagihan'}
          >
            <input
              type="number"
              min={nominal}
              className={inputClass}
              value={nominalBayar}
              onChange={(e) => setNominalBayar(e.target.value)}
            />
          </Field>
          <Field label="Tanggal bayar" required>
            <input type="date" className={inputClass} value={tanggalBayar} onChange={(e) => setTanggalBayar(e.target.value)} />
          </Field>
        </div>
      </ConfirmModal>

      <ConfirmModal
        open={!!toCancel}
        title="Batalkan Konfirmasi"
        message={
          toCancel
            ? `Batalkan pembayaran ${namaTagihan} ${labelPeriode(periode)} untuk ${toCancel.nama_kepala_keluarga || `KK ${toCancel.nomor_kk}`}? Transaksi rekap terkait juga akan dihapus.`
            : ''
        }
        onConfirm={handleBatal}
        onCancel={() => setToCancel(null)}
        loading={saving}
        confirmText="Batalkan Pembayaran"
        cancelText="Kembali"
      />
    </div>
  )
}
