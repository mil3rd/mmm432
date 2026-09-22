"use client";

import { useFormStatus } from "react-dom";

// Shared form primitives for the admin. The public site is art-directed;
// this side is deliberately plain — it's a tool, and a tool should get out
// of the way.

const INPUT =
  "w-full rounded-sm border border-line bg-card px-3 py-2 font-body text-sm text-ink " +
  "outline-none transition-colors placeholder:text-muted/60 focus:border-ink";

interface FieldProps {
  label: string;
  name: string;
  defaultValue?: string | null;
  placeholder?: string;
  hint?: string;
  type?: string;
  required?: boolean;
}

export function Field({ label, name, defaultValue, placeholder, hint, type = "text", required }: FieldProps) {
  return (
    <label className="block">
      <span className="font-body text-xs tracking-wide text-muted">
        {label}
        {required && <span className="text-red"> *</span>}
      </span>
      <input
        className={`mt-1.5 ${INPUT}`}
        name={name}
        type={type}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        required={required}
      />
      {hint && <span className="mt-1 block font-body text-xs text-muted">{hint}</span>}
    </label>
  );
}

export function TextArea({ label, name, defaultValue, placeholder, hint, rows = 4 }: FieldProps & { rows?: number }) {
  return (
    <label className="block">
      <span className="font-body text-xs tracking-wide text-muted">{label}</span>
      <textarea
        className={`mt-1.5 ${INPUT} resize-y`}
        name={name}
        rows={rows}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
      />
      {hint && <span className="mt-1 block font-body text-xs text-muted">{hint}</span>}
    </label>
  );
}

export function Checkbox({ label, name, defaultChecked, hint }: { label: string; name: string; defaultChecked?: boolean; hint?: string }) {
  return (
    <label className="flex items-start gap-3">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="mt-0.5 h-4 w-4 accent-red"
      />
      <span>
        <span className="font-body text-sm text-ink">{label}</span>
        {hint && <span className="mt-0.5 block font-body text-xs text-muted">{hint}</span>}
      </span>
    </label>
  );
}

export function Select({ label, name, defaultValue, options, hint }: {
  label: string;
  name: string;
  defaultValue?: string;
  options: { value: string; label: string }[];
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="font-body text-xs tracking-wide text-muted">{label}</span>
      <select className={`mt-1.5 ${INPUT}`} name={name} defaultValue={defaultValue}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {hint && <span className="mt-1 block font-body text-xs text-muted">{hint}</span>}
    </label>
  );
}

// Disables itself while the server action is in flight, so a slow database
// round-trip can't turn into three duplicate projects.
export function SubmitButton({ children = "Save", variant = "primary" }: { children?: React.ReactNode; variant?: "primary" | "danger" }) {
  const { pending } = useFormStatus();
  const base =
    "inline-flex items-center rounded-sm px-4 py-2 font-body text-sm transition-opacity disabled:opacity-50";
  const styles =
    variant === "danger"
      ? "border border-red text-red hover:bg-red hover:text-card"
      : "bg-ink text-paper hover:opacity-85";

  return (
    <button type="submit" disabled={pending} className={`${base} ${styles}`}>
      {pending ? "Saving…" : children}
    </button>
  );
}

export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="rounded-sm border border-red/40 bg-red/5 px-3 py-2 font-body text-sm text-red">
      {message}
    </p>
  );
}
