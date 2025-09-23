import React from "react";
import FieldError from "@/components/ui/form/FieldError.jsx";

export default function FieldForm({
  name,
  label,
  placeholder,
  type = "text",
  as = "input",
  options = [],
  size = "md",
  tone = "brand",
  dense = true,
  register, // ahora es opcional
  rules,
  error,
  rows = 4,
  className = "",
  wrapperClass = "",
  hint = "",
  autoComplete,
  min,
  max,
  step,
  disabled,
  required,
  value, // soporte modo controlado
  onChange, // soporte modo controlado
  onKeyDown, // handlers adicionales
  autoFocus, // autofocus
}) {
  const Comp = as;
  const sizeClass =
    size === "lg" ? "input-lg" : size === "sm" ? "input-sm" : "input-md";
  const toneClass =
    tone === "info"
      ? "focus-info"
      : tone === "success"
      ? "focus-success"
      : tone === "warning"
      ? "focus-warning"
      : tone === "danger"
      ? "focus-danger"
      : tone === "teal"
      ? "focus-teal"
      : tone === "pink"
      ? "focus-pink"
      : tone === "amber"
      ? "focus-amber"
      : "";
  const invalid = Boolean(error);
  const disabledClass = disabled
    ? "bg-[var(--brand-50)] text-[var(--brand-400)] cursor-not-allowed opacity-80"
    : "";

  // 👇 ahora checamos si register existe
  const hasRegister = typeof register === "function";

  return (
    <div className={`${dense ? "space-y-1.5" : "space-y-2"} ${wrapperClass}`}>
      {label && (
        <label className="label" htmlFor={name}>
          {label} {required ? "*" : null}
        </label>
      )}

      {as === "select" ? (
        <select
          id={name}
          aria-invalid={invalid}
          className={`input ${sizeClass} ${toneClass} ${
            invalid ? "input-error" : ""
          } ${className}`}
          disabled={disabled}
          {...(hasRegister
            ? register(name, rules)
            : { value: value ?? "", onChange })}
          onKeyDown={onKeyDown}
          autoFocus={autoFocus}
        >
          <option value="" disabled>
            {placeholder ?? "Selecciona una opción"}
          </option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <Comp
          id={name}
          type={as === "input" ? type : undefined}
          rows={as === "textarea" ? rows : undefined}
          placeholder={placeholder}
          aria-invalid={invalid}
          autoComplete={autoComplete}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          className={`input ${sizeClass} ${toneClass} ${
            invalid ? "input-error" : ""
          } ${disabledClass} ${className}`}
          {...(hasRegister
            ? register(name, rules)
            : { value: value ?? "", onChange })}
          onKeyDown={onKeyDown}
          autoFocus={autoFocus}
        />
      )}

      {hint && <p className="small-muted">{hint}</p>}
      <FieldError msg={error} />
    </div>
  );
}
