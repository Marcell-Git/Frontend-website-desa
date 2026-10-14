import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useNavigate } from 'react-router-dom'

export function Alert({ type = 'error', children }) {
  const styles = {
    error: 'bg-red-50 border-red-100 text-red-700',
    success: 'bg-emerald-50 border-emerald-100 text-emerald-700',
    info: 'bg-blue-50 border-blue-100 text-blue-700',
    warning: 'bg-amber-50 border-amber-100 text-amber-700',
  }
  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm ${styles[type] || styles.info}`}>
      {children}
    </div>
  )
}

export function Button({ variant = 'primary', size = 'md', className = '', ...props }) {
  const variants = {
    primary: 'bg-emerald-700 text-white shadow-sm shadow-emerald-900/20 hover:bg-emerald-800',
    secondary: 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50',
    danger: 'bg-rose-600 text-white hover:bg-rose-700',
    ghost: 'text-slate-600 hover:bg-slate-100',
  }
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
  }
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  )
}

export function Card({ className = '', children }) {
  return (
    <div className={`rounded-[28px] bg-white shadow-sm ring-1 ring-black/5 ${className}`}>
      {children}
    </div>
  )
}

// Link "← Kembali" kecil di atas judul halaman. to: path tujuan; tanpa to
// kembali ke halaman sebelumnya.
export function BackLink({ to, label = 'Kembali' }) {
  const navigate = useNavigate()
  const cls = 'mb-3 inline-flex items-center gap-2 text-sm text-slate-500 transition-colors hover:text-slate-900'
  const icon = (
    <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 10H4m5-5-5 5 5 5" />
    </svg>
  )
  return to ? (
    <Link to={to} className={cls}>
      {icon} {label}
    </Link>
  ) : (
    <button type="button" onClick={() => navigate(-1)} className={cls}>
      {icon} {label}
    </button>
  )
}

export function PageHeader({ title, description, back, children }) {
  return (
    <div className="mb-6">
      {back && <BackLink to={typeof back === 'string' ? back : undefined} />}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
          {description && <p className="mt-1.5 text-sm text-slate-500">{description}</p>}
        </div>
        {children}
      </div>
    </div>
  )
}

export function Badge({ color = 'slate', children }) {
  const colors = {
    slate: 'bg-slate-100 text-slate-600',
    green: 'bg-emerald-50 text-emerald-700',
    red: 'bg-rose-50 text-rose-700',
    blue: 'bg-blue-50 text-blue-700',
    amber: 'bg-amber-50 text-amber-700',
  }
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${colors[color]}`}>
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-70" aria-hidden="true" />
      {children}
    </span>
  )
}

export function Pagination({ page, totalPage, onChange }) {
  if (totalPage <= 1) return null
  const prev = page > 1
  const next = page < totalPage
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="text-xs text-slate-500">
        Halaman {page} dari {totalPage}
      </div>
      <div className="flex gap-2">
        <button
          className="rounded-full bg-white px-4 py-1.5 text-xs font-medium text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 disabled:opacity-40"
          disabled={!prev}
          onClick={() => onChange(page - 1)}
        >
          Sebelumnya
        </button>
        <button
          className="rounded-full bg-white px-4 py-1.5 text-xs font-medium text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 disabled:opacity-40"
          disabled={!next}
          onClick={() => onChange(page + 1)}
        >
          Berikutnya
        </button>
      </div>
    </div>
  )
}

export function Field({ label, error, required, children, hint }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
      {error && (
        <p className="mt-1 text-xs text-red-600">
          {Array.isArray(error) ? error.join(', ') : error}
        </p>
      )}
    </div>
  )
}

export const inputClass =
  'w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-2.5 text-sm transition-colors placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-100'

export function EmptyState({ message }) {
  return (
    <div className="px-6 py-12 text-center text-sm text-slate-400">{message}</div>
  )
}

export function Spinner({ label = 'Memuat...' }) {
  return (
    <div
      className="flex min-h-[120px] flex-col items-center justify-center gap-3 text-sm text-slate-400"
      role="status"
      aria-live="polite"
    >
      <svg className="h-6 w-6 animate-spin text-emerald-600" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
      </svg>
      {label}
    </div>
  )
}

export function TableSkeleton({ rows = 6, cols = 5 }) {
  return (
    <div className="px-4 py-2" role="status" aria-label="Memuat data...">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-4 border-b border-slate-100 py-4 last:border-0">
          {Array.from({ length: cols }, (_, j) => (
            <div
              key={j}
              className={`h-3.5 animate-pulse rounded-full bg-slate-100 ${
                j === 0 ? 'w-16' : j === cols - 1 ? 'ml-auto w-14' : 'w-[18%]'
              }`}
              style={{ animationDelay: `${(i * cols + j) * 40}ms` }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function ConfirmModal({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  loading,
  confirmText = 'Hapus',
  cancelText = 'Batal',
  danger = true,
  children,
}) {
  const panelRef = useRef(null)
  const cancelButtonRef = useRef(null)
  const restoreFocusRef = useRef(null)
  // Disimpan di ref agar effect fokus tidak berjalan ulang tiap render
  // (onCancel inline berubah tiap ketikan dan fokus input di children hilang).
  const onCancelRef = useRef(onCancel)
  const loadingRef = useRef(loading)
  onCancelRef.current = onCancel
  loadingRef.current = loading

  useEffect(() => {
    if (!open) return undefined
    restoreFocusRef.current = document.activeElement
    const timer = setTimeout(() => cancelButtonRef.current?.focus(), 0)

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !loadingRef.current) {
        e.stopPropagation()
        onCancelRef.current()
        return
      }
      if (e.key !== 'Tab' || !panelRef.current) return
      const focusables = Array.from(panelRef.current.querySelectorAll(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null,
      )
      if (focusables.length === 0) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown, true)
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true)
      clearTimeout(timer)
      restoreFocusRef.current?.focus?.()
    }
  }, [open])

  if (!open) return null

  return (
    <div
      className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !loading) onCancel()
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        className="animate-scale-in w-full max-w-md rounded-[28px] bg-white p-6 shadow-xl"
      >
        <h3 id="confirm-modal-title" className="text-lg font-semibold text-slate-900">
          {title}
        </h3>
        {message && <p className="mt-2 text-sm text-slate-600">{message}</p>}
        {children}
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={onCancel} disabled={loading} ref={cancelButtonRef}>
            {cancelText}
          </Button>
          <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm} disabled={loading}>
            {loading ? (
              <>
                <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                Memproses...
              </>
            ) : (
              confirmText
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

// Menu aksi "⋯" untuk baris data. Item: { label, onClick | to | href, danger,
// disabled, hint }. Item disabled tetap tampil dengan alasan di bawahnya
// supaya pengguna tahu kenapa aksinya tidak bisa dipakai.
export function ActionMenu({ items, label = 'Aksi' }) {
  const [pos, setPos] = useState(null)
  const buttonRef = useRef(null)
  const menuRef = useRef(null)
  const open = pos !== null

  // Dropdown dirender lewat portal dengan posisi fixed supaya tidak terpotong
  // oleh wadah tabel yang overflow-x-auto. Membuka ke atas jika ruang di
  // bawah tombol tidak cukup.
  const toggle = () => {
    if (open) {
      setPos(null)
      return
    }
    const rect = buttonRef.current.getBoundingClientRect()
    const perkiraanTinggi = items.filter(Boolean).length * 52 + 16
    const keAtas = rect.bottom + perkiraanTinggi + 8 > window.innerHeight && rect.top > perkiraanTinggi
    setPos({
      right: window.innerWidth - rect.right,
      ...(keAtas ? { bottom: window.innerHeight - rect.top + 8 } : { top: rect.bottom + 8 }),
    })
  }

  useEffect(() => {
    if (!open) return undefined
    const close = (e) => {
      if (buttonRef.current?.contains(e.target) || menuRef.current?.contains(e.target)) return
      setPos(null)
    }
    const esc = (e) => e.key === 'Escape' && setPos(null)
    const tutup = () => setPos(null)
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', esc)
    window.addEventListener('scroll', tutup, true)
    window.addEventListener('resize', tutup)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', esc)
      window.removeEventListener('scroll', tutup, true)
      window.removeEventListener('resize', tutup)
    }
  }, [open])

  const visible = items.filter(Boolean)
  if (visible.length === 0) return null

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={toggle}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 ring-1 ring-slate-200 transition-colors hover:bg-slate-50 hover:text-slate-700"
      >
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <circle cx="4" cy="10" r="1.6" />
          <circle cx="10" cy="10" r="1.6" />
          <circle cx="16" cy="10" r="1.6" />
        </svg>
      </button>
      {open && createPortal(
        <div
          ref={menuRef}
          role="menu"
          style={pos}
          className="animate-scale-in fixed z-50 w-56 rounded-2xl bg-white p-1.5 shadow-xl ring-1 ring-black/5"
        >
          {visible.map((item) => {
            const cls = `block w-full rounded-xl px-3 py-2 text-left text-sm ${
              item.disabled
                ? 'cursor-not-allowed text-slate-300'
                : item.danger
                  ? 'text-rose-600 hover:bg-rose-50'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`
            const body = (
              <>
                {item.label}
                {item.disabled && item.hint && (
                  <span className="mt-0.5 block text-xs leading-snug text-slate-400">{item.hint}</span>
                )}
              </>
            )
            if (item.href && !item.disabled) {
              return (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  role="menuitem"
                  className={cls}
                  onClick={() => setPos(null)}
                >
                  {body}
                </a>
              )
            }
            if (item.to && !item.disabled) {
              return (
                <Link key={item.label} to={item.to} role="menuitem" className={cls} onClick={() => setPos(null)}>
                  {body}
                </Link>
              )
            }
            return (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                disabled={item.disabled}
                className={cls}
                onClick={() => {
                  setPos(null)
                  item.onClick?.()
                }}
              >
                {body}
              </button>
            )
          })}
        </div>,
        document.body,
      )}
    </>
  )
}

// Tombol aksi utama di baris tabel (mis. Detail), tampil di samping ActionMenu.
export const rowLinkClass =
  'inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200 transition-colors hover:bg-emerald-700 hover:text-white hover:ring-emerald-700'

// Tab berbentuk pil (segmented control). Bisa digeser horizontal di layar
// sempit. tabs: [{ key, label }].
export function Tabs({ tabs, value, onChange, className = '' }) {
  return (
    <div className={`max-w-full overflow-x-auto ${className}`}>
      <div role="tablist" className="inline-flex gap-1 rounded-full bg-white p-1 shadow-sm ring-1 ring-black/5">
        {tabs.map((tab) => {
          const active = value === tab.key
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange(tab.key)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                active
                  ? 'bg-emerald-700 text-white shadow-sm shadow-emerald-900/20'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// Kolom pada toolbar cari/filter di atas tabel. Berbeda dengan inputClass
// (w-full untuk form), lebarnya tetap supaya cari + filter muat satu baris.
const toolbarBase =
  'rounded-full border border-slate-200 bg-slate-50/60 px-4 py-2.5 text-sm text-slate-700 transition-colors placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-100'
export const toolbarClass = 'flex flex-wrap items-center gap-2'
export const toolbarSearchClass = `search-input ${toolbarBase} w-full sm:w-72`
export const toolbarFieldClass = `${toolbarBase} w-full sm:w-auto sm:min-w-40`

// Baris tombol di bagian bawah kartu form (Batal / Simpan).
export function FormActions({ children, className = '' }) {
  return (
    <div className={`mt-6 flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-5 ${className}`}>
      {children}
    </div>
  )
}

// Kartu penjelasan singkat di samping form yang isinya sedikit.
export function InfoCard({ title, children, icon }) {
  return (
    <Card className="self-start p-5">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
          {icon ?? (
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <circle cx="10" cy="10" r="7.5" />
              <path d="M10 9v5M10 6.5v.01" />
            </svg>
          )}
        </span>
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      </div>
      <div className="mt-3 space-y-2 text-sm leading-relaxed text-slate-500">{children}</div>
    </Card>
  )
}

// Judul bagian di dalam kartu form.
export function FormSection({ title, description, children, className = '' }) {
  return (
    <div className={className}>
      <h3 className="text-base font-semibold text-slate-800">{title}</h3>
      {description && <p className="mt-0.5 text-xs text-slate-400">{description}</p>}
      <div className="mt-4">{children}</div>
    </div>
  )
}
