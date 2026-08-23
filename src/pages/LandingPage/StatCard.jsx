export default function StatCard({ label, value, highlight = false, icon = null }) {
  return (
    <div
      className={`flex items-start gap-3 rounded-xl border p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5 ${
        highlight
          ? 'border-emerald-600 bg-emerald-600 shadow-emerald-900/10'
          : 'border-slate-200 bg-white'
      }`}
    >
      {icon && (
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
            highlight ? 'bg-white/15 text-white' : 'bg-emerald-50 text-emerald-700'
          }`}
        >
          {icon}
        </div>
      )}
      <div className="min-w-0">
        <div
          className={`text-[11px] font-semibold uppercase tracking-wide ${
            highlight ? 'text-emerald-100' : 'text-slate-500'
          }`}
        >
          {label}
        </div>
        <div
          className={`mt-1 truncate font-display text-base font-bold tabular-nums sm:text-lg ${
            highlight ? 'text-white' : 'text-slate-900'
          }`}
          title={value}
        >
          {value}
        </div>
      </div>
    </div>
  )
}
