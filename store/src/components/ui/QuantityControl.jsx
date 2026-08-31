import { Minus, Plus } from "lucide-react";

// Reusable quantity control — extracted from product-detail.html and cart.html
export function QuantityControl({
  value,
  onDecrease,
  onIncrease,
  size = "default",
  className = "",
  error,
  id,
  disabled,
}) {
  const inputId = id || undefined;
  const errorId = error && inputId ? `${inputId}-error` : undefined;
  const hasError = !!error;
  const btnBase = "flex items-center justify-center cursor-pointer transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[#111] focus-visible:ring-offset-1";
  const btnClass = size === "sm"
    ? `${btnBase} bg-none border rounded p-[3px] ${hasError ? 'border-red-400 text-red-500 hover:border-red-500 hover:text-red-600' : 'border-black/10 text-[#888] hover:border-[#111] hover:text-[#111]'} ${disabled ? 'opacity-40 cursor-not-allowed hover:border-black/10 hover:text-[#888]' : ''}`
    : `${btnBase} w-9 h-9 rounded-lg border ${hasError ? 'border-red-400 text-red-500 hover:border-red-500' : 'border-[#e6e6e6] text-[#555] hover:border-[#1a1a1a]'} ${disabled ? 'opacity-40 cursor-not-allowed hover:border-[#e6e6e6]' : ''}`;

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <div className="flex items-center gap-3" id={inputId}>
        <button
          type="button"
          onClick={onDecrease}
          disabled={disabled}
          aria-label="Kurangi jumlah"
          aria-invalid={hasError}
          aria-describedby={errorId}
          className={btnClass}
        >
          <Minus size={13} strokeWidth={1.5} />
        </button>
        <span className={`font-sans text-[13px] font-medium min-w-[12px] text-center ${hasError ? 'text-red-500' : 'text-[#1a1a1a]'}`}>
          {value}
        </span>
        <button
          type="button"
          onClick={onIncrease}
          disabled={disabled}
          aria-label="Tambah jumlah"
          aria-invalid={hasError}
          aria-describedby={errorId}
          className={btnClass}
        >
          <Plus size={13} strokeWidth={1.5} />
        </button>
      </div>
      {error && <span id={errorId} className="font-sans text-[11px] text-red-500 leading-none" role="alert">{error}</span>}
    </div>
  );
}

// Product-detail styled variant alias
export function QuantityStepper({ value, onChange, min = 1, error, id, disabled }) {
  return (
    <QuantityControl
      value={value}
      error={error}
      id={id}
      disabled={disabled}
      onDecrease={() => onChange(Math.max(min, value - 1))}
      onIncrease={() => onChange(value + 1)}
    />
  );
}
