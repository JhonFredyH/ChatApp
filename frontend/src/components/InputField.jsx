import { Mail, Lock, User } from "lucide-react";

const ICONS = { mail: Mail, lock: Lock, user: User };

export function InputField({ id, label, type = "text", placeholder, value, onChange, error, icon = null, marginTop = false }) {
  const Icon = icon ? ICONS[icon] : null;

  return (
    <div className={marginTop ? "mt-10" : ""}>
      <label htmlFor={id} className="mb-1.5 block font-mono text-[length:var(--text-xs)] uppercase tracking-[0.12em] text-[color:var(--text-muted)]">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[color:var(--text-muted)]">
            <Icon size={15} strokeWidth={1.6} />
          </span>
        )}
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => { onChange(e.target.value); }}
          placeholder={placeholder}
          required
          aria-invalid={!!error}
          className={`w-full rounded-lg border bg-[var(--bg-dark-tertiary)] py-2.5 ${icon ? "pl-9" : "pl-4"} pr-4 text-[length:var(--text-sm)] text-[color:var(--text-on-dark)] outline-none transition-all duration-200 placeholder:text-[color:var(--text-muted)] focus:border-[var(--primary)] ${error ? "border-[#E24B4A]" : "border-[var(--border-dark)]"}`}
        />
      </div>
      {error && <p className="mt-1.5 text-[length:var(--text-xs)] text-[#E24B4A]">{error}</p>}
    </div>
  );
}